import { cn } from "@/lib/utils";

export function ActiveIcon({ style }: { style?: string }) {
  return (
    <span
      className={cn("absolute right-[.1rem] bottom-[.1rem] w-[.68rem] h-[.68rem] rounded-full bg-green-600 z-[30]",
        style
      )}
    />
  )
}
