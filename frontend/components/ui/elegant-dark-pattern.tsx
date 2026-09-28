import type React from "react"
import { cn } from "@/lib/utils"
import { MeshGradient } from "@paper-design/shaders-react"

interface DarkGradientBgProps {
  children?: React.ReactNode
  className?: string
}

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div
      className={cn("relative min-h-screen w-full bg-black overflow-hidden", className)}
    >
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#1a1a1a", "#ffffff", "#404040", "#050505"]}
        speed={0.05} // Slight motion
      />
      
      {/* Subtle overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  )
}
