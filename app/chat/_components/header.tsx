"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useAuth } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

export default function Header({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const router = useRouter()
  const { userId } = useAuth()

  const conversationId = pathname?.split("/chat/")?.[1]
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get our delete mutation
  const deleteConversation = useMutation(api.chats.deleteConversation)

  const handleDelete = async () => {
    if (!conversationId || !userId) return;

    try {
      setIsDeleting(true)
      await deleteConversation({
        userId,
        conversationId: conversationId as Id<"conversations">
      })

      toast.success("Chat deleted successfully")
      router.push("/chat")
    } catch (error) {
      toast.error("Failed to delete chat");
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }

  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen overflow-hidden bg-black">
      <header className="h-[59px] flex items-center justify-between px-4 py-2 border-b border-[#00ff41]/20 bg-black z-10">
        <div className="flex justify-end w-full space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#00ff41] hover:bg-[#00ff41]/10">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black border border-[#00ff41]/30 text-[#00ff41] font-mono" align="end">
              <DropdownMenuItem
                onClick={() => setShowDeleteAlert(true)}
                className="text-[#ff5555] hover:bg-[#ff5555]/10 focus:bg-[#ff5555]/10 focus:text-[#ff5555] cursor-pointer"
              >Delete Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-black border border-[#00ff41]/30 text-[#00ff41] font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#00ff41]">{`>_ Confirm Deletion`}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#00ff41]/80">
              WARNING: This action is irreversible. All chat data will be permanently erased.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-[#00ff41]/30 text-[#00ff41] hover:bg-[#00ff41]/10 hover:text-[#00ff41]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#ff5555] hover:bg-[#ff3333] text-black font-mono"
            >
{`>_`} CONFIRM DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {children}
    </div>
  )
}