import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@clerk/nextjs"
import { Avatar } from "@radix-ui/react-avatar"
import { Preloaded, usePreloadedQuery } from "convex/react"
import { MoreVertical, Search, Users2 } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import SearchComponent from "./search"

interface SideBarProps {
  preloadedUserInfo: Preloaded<typeof api.users.readUser>;
  preloadedConversations: Preloaded<typeof api.chats.getConversation>;
}


export default function Sidebar({ preloadedUserInfo, preloadedConversations }: SideBarProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const { signOut } = useAuth()
  const router = useRouter()
  const userInfo = usePreloadedQuery(preloadedUserInfo)
  const conversations = usePreloadedQuery(preloadedConversations)

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations

    return conversations?.
      filter((chat) => {
        const matchesName = chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesMessage = chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesName || matchesMessage
      }).sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase())
        const bNameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase())

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1

        return 0
      })


  }, [searchQuery, conversations])


  return (
    <div className="w-80 h-full flex flex-col bg-black border-r border-[#00ff41]/20 flex-shrink-0">
      {/* Header - Matches main header styling */}
      <div className="h-[59px] flex items-center justify-between px-4 py-2 border-b border-[#00ff41]/20 bg-black z-10">
        <div className="flex items-center gap-3 bg-black">
          <Link href="/profile" className="group relative">
            <div className="absolute inset-0 rounded-full bg-[#00ff41] opacity-0 group-hover:opacity-20 transition-opacity" />
            <Avatar>
              <AvatarImage 
                className="w-8 h-8 rounded-full border border-[#00ff41]/30" 
                src={userInfo?.profileImage} 
                alt="Your avatar" 
              />
              <AvatarFallback className="bg-[#00ff41]/10 text-[#00ff41] font-mono">
                {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <span className="text-[#00ff41] font-mono text-sm hidden md:block bg-black">
            {userInfo?.username || 'User'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <SearchComponent onSidebar={true} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-[#00ff41] hover:bg-[#00ff41]/10"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black border border-[#00ff41]/30 text-[#00ff41] font-mono" align="end">
              <DropdownMenuItem 
                onClick={() => {
                  signOut()
                  router.push("/")
                }}
                className="cursor-pointer hover:bg-[#00ff41]/10 focus:bg-[#00ff41]/10 focus:text-[#00ff41]"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Search Input */}
      <div className="hidden md:block p-2 bg-black">
        <div className="relative bg-black border border-[#00ff41]/30 rounded-md flex items-center hover:border-[#00ff41]/60 transition-colors">
          <div className="pl-3 pr-2 py-2">
            <Search className="h-4 w-4 text-[#00ff41]/80" />
          </div>
          <input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-[#00ff41] placeholder:text-[#00ff41]/50 focus:outline-none py-2 text-sm font-mono focus:ring-0 focus:ring-offset-0"
          />
        </div>
      </div>
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations?.map((chat) => (
          <Link href={`/chat/${chat.id}`} key={chat.id}>
            <div className={`flex items-center p-4 hover:bg-[#00ff41]/10 cursor-pointer border-b border-[#00ff41]/10 ${pathname.split("/")?.[2] === chat?.id ? "bg-[#202C33]" : ""}`}>
              <div className="relative">
                <Avatar>
                  <AvatarImage className="w-12 h-12 rounded-full" src={chat?.chatImage} />
                  <AvatarFallback className="bg-[#6B7C85]">
                    <Users2 className="h-6 w-6 text-[#CFD9DF]" />
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Conversation details - Only visible on md and larger screens */}
              <div className="hidden md:block flex-1 min-w-0 ml-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-mono text-[#00ff41] truncate">
                    <HighlightText text={chat.name} searchQuery={searchQuery} />
                  </h3>
                  <span className="text-[#8696A0] text-xs ml-2 shrink-0">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between p-4 border-b border-[#00ff41]/20">
                  <p className="text-[#8696A0] text-sm truncate pr-2">
                    {chat.type === "image" ? (
                      <span className="flex items-center gap-1">
                        <span className="text-[#8696A0]">📸</span> Photo
                      </span>
                    ) : (
                      <HighlightText text={chat.lastMessage} searchQuery={searchQuery} />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}

const HighlightText = ({ text, searchQuery }: {
  text: string,
  searchQuery: string
}) => {
  if (!searchQuery) return <>{text}</>

  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))

  return (
    <>
      {parts.map((part, i) => (
        part.toLowerCase() === searchQuery.toLowerCase() ?
          <span key={i} className="bg-[#00A884] text-[#111B21] px-0.5 rounded">
            {part}
          </span>
          :
          <span key={i}>{part}</span>
      ))}
    </>
  )
}