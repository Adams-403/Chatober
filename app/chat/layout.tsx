import { api } from "@/convex/_generated/api"
import { auth } from "@clerk/nextjs/server"
import { preloadQuery } from "convex/nextjs"
import { redirect } from "next/navigation"
import ChatLayoutWrapper from "./_components/chat-layout-wrapper"

export default async function ChatLayout({ children }: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = session.userId

  if (!userId) {
    return redirect('/sign-in')
  }

  try {
    // user information
    const preloadedUserInfo = await preloadQuery(api.users.readUser, {
      userId
    })
    
    // conversations + chats
    const preloadedConversations = await preloadQuery(api.chats.getConversation, {
      userId
    })

    return (
      <div className="bg-black h-full">
        <ChatLayoutWrapper
          preloadedUserInfo={preloadedUserInfo}
          preloadedConversations={preloadedConversations}
        >
          {children}
        </ChatLayoutWrapper>
      </div>
    )
  } catch (error) {
    console.error("Error loading chat data:", error)
    // You might want to show an error boundary or a more specific error message here
    return <div>Error loading chat. Please try again later.</div>
  }
}