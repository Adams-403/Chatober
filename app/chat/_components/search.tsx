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
      <div className="h-12 w-12 rounded-full bg-[#202C33] mr-3" />
      <div className="flex-1">
        <div className="h-4 bg-[#202C33] rounded w-1/3 mb-2" />
        <div className="h-3 bg-[#202C33] rounded w-1/2" />
      </div>
    </div>
  )


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {onSidebar ? <Button variant="ghost" size="icon">
          <MessageSquareMore className="w-5 h-5" />
        </Button> :
          <div className="mt-5">
            <Button className="bg-[#00A884] hover:bg-[#02906f] text-[#111B21]">
              Bother Somebody
            </Button>
          </div>
        }
      </DialogTrigger>
      <DialogTitle></DialogTitle>
      <DialogContent className="w-full max-w-[380px] p-0 bg-[#111B21] border-[#313D45]">
        <DialogHeader className="p-0">
          {/* Header */}
          <div className="bg-[#202C33] p-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-[#AEBAC1] hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-[#E9EDEF] text-base font-medium">New Chat</h2>
          </div>

          {/* Search Input */}
          <div className="p-2 bg-[#111B21]">
            <div className="relative bg-[#202C33] rounded-lg flex items-center">
              <div className="pl-4 pr-2 py-2">
                <Search className="w-5 h-5 text-[#8696A0]" />
              </div>
              <input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search Contacts"
                className="w-full bg-transparent border-none text-[#E9EDEF] placeholder:text-[#8696A0] focus:outline-none py-2 text-base"
              />
            </div>
          </div>


          {/* Results with fixed height container */}
          <div className="overflow-y-auto max-h-[400px] min-h-[300px]">
            {isPending ? (
              <>
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </>
            ) :
              <>
                {searchResults?.map((user) => (
                  <div key={user.userId}
                    onClick={() => handleStartChat(user.userId)}
                    className="flex items-center px-4 py-3 hover:bg-[#202C33] cursor-pointer transition-colors"
                  >
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="bg-[#6B7C85]">
                        <Users2 className="h-6 w-6 text-[#CFD9DF]" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#E9EDEF] text-base font-normal truncate">
                        {user.name}
                      </h3>
                    </div>
                  </div>
                ))}
                {searchResults?.length === 0 && debouncedTerm && (
                  <div className="p-4 text-center text-[#8696A0]">
                    No contacts found
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