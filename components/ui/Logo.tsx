import Image from "next/image"

export function Logo({ className = "w-10 h-10", showText = false, textClass = "text-xl text-brand-dark" }: { className?: string; showText?: boolean; textClass?: string }) {
  return (
    <div className={`flex items-center gap-2 ${showText ? "" : className}`}>
      <div className={`relative ${showText ? className : "w-full h-full"}`}>
        <Image src="/logo.png" alt="TeleNurse Logo" fill className="object-contain" priority />
      </div>
      {showText && (
        <span className={`font-jakarta font-extrabold tracking-wide ${textClass}`}>
          TeleNurse
        </span>
      )}
    </div>
  )
}
