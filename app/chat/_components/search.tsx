"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import debounce from 'lodash/debounce'
import { ArrowLeft, MessageSquareMore, Search, Users2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState, useTransition } from "react"

export default function SearchComponent({ onSidebar }: { onSidebar: boolean }) {
  const { userId } = useAuth()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedTerm, setDebouncedTerm] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const createConversation = useMutation(api.chats.createOrGetConversation)

  const debouncedSearch = useCallback(
    // Debounce function that delays executing the search
    debounce((term: string) => {
      // startTransition allows React to prioritize urgent updates
      startTransition(() => {
        // Update the search term after a delay
        setDebouncedTerm(term)
      })
    }, 300),
    [],
  )

  const searchResults = useQuery(api.users.searchUsers, {
    searchTerm: debouncedTerm,
    currentUserId: userId || ""
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const handleStartChat = async (selectedUserId: string) => {
    try {
      const conversationId = await createConversation({
        participantUserId: selectedUserId,
        currentUserId: userId!
      })

      setIsOpen(false)
      router.push(`/chat/${conversationId}`)
    } catch (error) {
      console.error("Error creating conversation " + error)
    }
  }

  // Prepare skeleton items for loading state
  const SkeletonItem = () => (
    <div className="flex items-center px-4 py-3 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-[#00ff41]/10 border border-[#00ff41]/20 mr-3" />
      <div className="flex-1">
        <div className="h-4 bg-[#00ff41]/10 rounded w-1/3 mb-2" />
        <div className="h-3 bg-[#00ff41]/10 rounded w-1/2" />
      </div>
    </div>
  )


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {onSidebar ? <Button variant="ghost" size="icon" className="text-[#00ff41] hover:bg-[#00ff41]/10">
          <MessageSquareMore className="w-5 h-5" />
        </Button> :
          <div className="mt-5">
            <Button className="bg-[#00ff41] hover:bg-[#00cc33] text-black font-mono border border-[#00ff41]/50">
              {`>_ NEW CHAT`}
            </Button>
          </div>
        }
      </DialogTrigger>
      <DialogTitle className="sr-only">Search Contacts</DialogTitle>
      <DialogContent className="w-full max-w-md p-0 bg-black border border-[#00ff41]/30 font-mono">
        <DialogHeader className="p-0">
          {/* Header */}
          <div className="bg-black p-4 flex items-center gap-4 border-b border-[#00ff41]/20">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#00ff41] hover:bg-[#00ff41]/10"
              onClick={() => setIsOpen(false)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-[#00ff41] text-base font-mono">{`>_ SEARCH CONTACTS`}</h2>
          </div>

          {/* Search Input */}
          <div className="p-4 bg-black">
            <div className="relative border border-[#00ff41]/30 rounded flex items-center bg-black">
              <div className="pl-4 pr-2 py-2">
                <Search className="w-5 h-5 text-[#00ff41]/70" />
              </div>
              <input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Enter contact name..."
                className="w-full bg-transparent border-none text-[#00ff41] placeholder:text-[#00ff41]/50 focus:outline-none py-3 text-sm font-mono focus:ring-1 focus:ring-[#00ff41] focus:ring-offset-1 focus:ring-offset-black"
              />
            </div>
          </div>


          {/* Results with fixed height container */}
          <div className="overflow-y-auto max-h-[400px] min-h-[300px] border-t border-[#00ff41]/10">
            {isPending ? (
              <>
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </>
            ) :
              <>
                {searchResults?.map((user) => (
                  <div 
                    key={user.userId}
                    onClick={() => handleStartChat(user.userId)}
                    className="flex items-center px-4 py-3 hover:bg-[#00ff41]/5 cursor-pointer transition-colors border-b border-[#00ff41]/5"
                  >
                    <Avatar className="h-12 w-12 mr-3 border border-[#00ff41]/20">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="bg-[#00ff41]/10 text-[#00ff41]">
                        <Users2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#00ff41] text-sm font-mono truncate">
                        {user.name}
                      </h3>
                      <p className="text-[#00ff41]/50 text-xs font-mono">
                        {`user_${user.userId.substring(0, 6)}`}
                      </p>
                    </div>
                    <div className="text-[#00ff41]/50 text-xs">
                      {`>`}
                    </div>
                  </div>
                ))}
                {searchResults?.length === 0 && debouncedTerm && (
                  <div className="p-6 text-center text-[#00ff41]/50 font-mono">
                    {`>_ NO RESULTS FOR "${debouncedTerm}"`}
                  </div>
                )}

                {!debouncedTerm && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[#8696A0] text-sm">
                      Search for users to start a new chat
                    </p>
                  </div>
                )}
              </>
            }
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}