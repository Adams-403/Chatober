import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { auth } from "@clerk/nextjs/server"
import { preloadQuery } from "convex/nextjs"
import ChatList from "../_components/chat-list"
import FormChat from "../_components/form"

export default async function Conversations({ params }: { params: Promise<{ id: string }> }) {

  const conversationId = (await params).id
  const { userId } = await auth()

  const preloadedMessages = await preloadQuery(api.chats.getMessages, {
    conversationId: conversationId as Id<"conversations">
  })

  return (
    <div className="h-screen flex flex-col w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatList userId={userId!} preloadedMessages={preloadedMessages} />
        <FormChat userId={userId!} conversationId={conversationId} />
      </div>
    </div>
  )
}