import { api } from "@/convex/_generated/api"
import { auth } from "@clerk/nextjs/server"
import { preloadQuery } from "convex/nextjs"
import ChatLayoutWrapper from "./_components/chat-layout-wrapper"

export default async function ChatLayout({ children }: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  // user information
  const preloadedUserInfo = await preloadQuery(api.users.readUser, {
    userId: userId!
  })
  // conversations + chats
  const preloadedConversations = await preloadQuery(api.chats.getConversation, {
    userId: userId!
  })

  // preloaded chat

  return (
    <ChatLayoutWrapper
      preloadedUserInfo={preloadedUserInfo}
      preloadedConversations={preloadedConversations}
    >
      {children}
    </ChatLayoutWrapper>
  )
}