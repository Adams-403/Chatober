"use client"

import { Lock } from "lucide-react"
import { useEffect, useState } from "react"

export default function LoadingState() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 1
      })
    }, 50) // Update every 50ms to complete in 5 seconds (50ms * 100 = 5000ms)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen bg-black text-[#00ff41] font-mono">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#00ff41] opacity-20 blur-lg rounded-full -z-10"></div>
          <Lock className="h-20 w-20 mx-auto text-[#00ff41] animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2 glitch" data-text="CHATOBER_LOADING">
          CHATOBER_LOADING
        </h2>
        
        <p className="text-lg mb-6 text-[#00ff41]/80">
          {`>_ Initializing secure connection... ${progress}%`}
        </p>
        
        <div className="w-full max-w-md">
          <div className="h-1 w-full bg-[#00ff41]/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#00ff41] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-4 bg-white/50 absolute right-0 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-[#00ff41]/50">
          <p>Establishing secure tunnel...</p>
          <p className="mt-1">Encryption: AES-256 | Protocol: TLS 1.3</p>
        </div>
      </div>
    </div>
  )
}