import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// createOrGetConversation()
export const createOrGetConversation = mutation({
  args: {
    participantUserId: v.string(),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Helper function to get or create a user
    async function getOrCreateUser(userId: string) {
      let user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (!user) {
        // If user doesn't exist, create a minimal user record
        const newUserId = await ctx.db.insert("users", {
          userId,
          email: `${userId}@example.com`, // Placeholder email
          name: `User ${userId.substring(0, 6)}`, // Generic name based on ID
          createdAt: Date.now(),
          profileImage: ""
        });
        user = await ctx.db.get(newUserId);
      }

      if (!user) {
        throw new Error(`Failed to get or create user ${userId}`);
      }

      return user;
    }

    // Get or create both users
    const [currentUser, otherUser] = await Promise.all([
      getOrCreateUser(args.currentUserId),
      getOrCreateUser(args.participantUserId)
    ]);

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("participantOne"), currentUser._id),
            q.eq(q.field("participantTwo"), otherUser._id)
          ),
          q.and(
            q.eq(q.field("participantOne"), otherUser._id),
            q.eq(q.field("participantTwo"), currentUser._id)
          )
        )
      )
      .first();

    if (existingConversation) {
      return existingConversation?._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      participantOne: currentUser._id,
      participantTwo: otherUser._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return conversationId;
  },
});

// sendMessage()
export const sendMessage = mutation({
  args: {
    converstaionId: v.id("conversations"),
    content: v.string(),
    senderId: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"))),
    mediaUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sender = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.senderId))
      .first();

    if (!sender) throw new Error("Sender not found");

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.converstaionId,
      senderId: sender._id,
      content: args.content,
      type: args.type ?? "text",
      mediaUrl: args.mediaUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEdited: false,
    });

    await ctx.db.patch(args.converstaionId, {
      lastMessageId: messageId,
      updatedAt: Date.now(),
    });

    return messageId;
  },
});

const formatChatTime = (date: Date) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    // Today: show time only
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (date.toDateString() === yesterday.toDateString()) {
    // Yesterday
    return 'Yesterday';
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // Within last week: show day name
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    // Older: show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// getConversation()
export const getConversation = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!user) {
      return [];
    }

    const conversations = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participantOne"), user._id),
          q.eq(q.field("participantTwo"), user._id)
        )
      )
      .collect();

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipantId =
          conv.participantOne === user._id
            ? conv.participantTwo
            : conv.participantOne;

        const otherUser = await ctx.db.get(otherParticipantId);
        const lastMessage = conv.lastMessageId
          ? await ctx.db.get(conv.lastMessageId)
          : null;

        return {
          id: conv._id,
          name: otherUser?.name ?? "Unknown",
          chatImage: otherUser?.profileImage,
          lastMessage: lastMessage?.content ?? "",
          time: formatChatTime(new Date(conv.updatedAt)),
          unread: 0, // You can implement unread count logic here
          type: lastMessage?.type,
        };
      })
    );

    return conversationsWithDetails.sort((a: any, b: any) => b.time - a.time);
  },
});

// getMessages()
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .order("asc")
      .take(args.limit ?? 50);

    return await Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          id: msg._id,
          sender_userId: sender?.userId,
          sender: sender?.name ?? "Unknown",
          content: msg.content,
          time: formatChatTime(new Date(msg.createdAt)),
          isSent: true, // You'll need to compare with current user ID in the frontend
          type: msg.type,
          mediaUrl: msg.mediaUrl,
        };
      })
    );
  },
});

// deleteConversation()
export const deleteConversation = mutation({
  args: {
    userId: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // Get the user from Clerk userId
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the conversation to verify ownership
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify user is part of the conversation
    if (
      conversation.participantOne !== user._id &&
      conversation.participantTwo !== user._id
    ) {
      throw new Error("Unauthorized to delete this conversation");
    }

    // Get all messages in the conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Delete all messages
    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));

    // Finally delete the conversation
    await ctx.db.delete(args.conversationId);

    return {
      success: true,
      deletedMessages: messages.length,
      // deletedMedia: mediaItems.length,
    };
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getUploadUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});
