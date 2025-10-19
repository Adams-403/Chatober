import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-cetner justify-center bg-[#00A884] dark:bg-[#111B21] text-white p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          Welcome to Not WhatsApp
        </h1>
        <p className="text-xl md:text-2xl text-white/80">
          It&apos;s like WhatsApp, but not... You know what we mean.
        </p>
        <Button asChild size="lg" className="bg-white text-[#00A884] hover:bg-gray-100 dark:bg-[#202C33] dark:text-white dark:hover:bg-[#2A3942]">
          <Link href="/chat" className="text-lg font-semibold">
            Start Chatting
          </Link>
        </Button>
      </div>
    </main>
  );
}
