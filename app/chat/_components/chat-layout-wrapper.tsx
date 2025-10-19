"use client"
import LoadingState from "@/components/loading";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useEffect, useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";

interface ChatLayoutProps {
  children: React.ReactNode;
  preloadedUserInfo: Preloaded<typeof api.users.readUser>;
  preloadedConversations: Preloaded<typeof api.chats.getConversation>;
}

export default function ChatLayoutWrapper({ children, preloadedUserInfo, preloadedConversations }: ChatLayoutProps) {

  // Sidebar
  // Header
  // Nice loading state

  const { isLoaded, isSignedIn } = useAuth()
  const [shouldShowLoading, setShouldShowLoading] = useState(true)

  const userInfo = usePreloadedQuery(preloadedUserInfo)
  const conversations = usePreloadedQuery(preloadedConversations)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShowLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [])

  const isLoading = !isLoaded || userInfo === undefined || shouldShowLoading || conversations === undefined

  if (isLoading) {
    return <LoadingState />
  }

  if (!isSignedIn) {
    return null;
  }
  return (
    <div className="flex h-screen bg-background dark:bg-[#111B21] overflow-hidden">
      <Sidebar preloadedUserInfo={preloadedUserInfo} preloadedConversations={preloadedConversations} />
      <Header>
        {children}
      </Header>
    </div>
  )
}