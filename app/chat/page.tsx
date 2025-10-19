import { Laptop } from "lucide-react";
import SearchComponent from "./_components/search";

export default function ChatHomeScreen() {

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center bg-black text-center">
        <div className="max-w-md space-y-2">
          <Laptop className="w-72 h-72 mx-auto text-[#00ff41] opacity-70" />
          <h2 className="text-[#00ff41] text-4xl font-mono tracking-wider glitch" data-text="CHATOBER_1.3.3.7">
            CHATOBER_1.3.3.7
          </h2>
          <p className="text-[#00ff41]/80 font-mono">
            {`>_ Secure terminal for encrypted communications`}
          </p>
          <SearchComponent onSidebar={false} />
        </div>
      </div>
    </>
  )
}