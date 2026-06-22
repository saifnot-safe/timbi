"use client"
import { Show, SignInButton, UserButton } from "@clerk/nextjs"
import { useAuth } from "@clerk/nextjs"
export default function TimbiHeader() {
  const { isSignedIn } = useAuth()
  return (
    
  <header className="sticky top-0 h-16 z-9999 flex w-full items-center justify-between border-b-1 border-[#ffebd0] bg-[#ffebd0] px-4 py-1.5 backdrop-blur">
 <div className="flex items-center gap-4">

<Show when="signed-out">
  <SignInButton mode="modal">
    <button className="rounded-full bg-[#FFA353] px-4 py-2 font-bold text-white shadow-md transition hover:scale-105">
      Sign In
    </button>
  </SignInButton>
</Show>

<Show when="signed-in">
  <UserButton />
</Show>



  <div className="flex items-center gap-0">
  </div>
</div>
</header>
  );
}