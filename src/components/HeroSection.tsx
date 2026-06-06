"use client";

import { useState } from "react";
import Timbi from "./Timbi";
import TimbiTitle from "./TimbiTitle";
import PostFoodModal from "./PostFoodModal";
import { SignInButton, useUser } from "@clerk/nextjs";

export default function HeroSection() {
    const [isPostOpen, setIsPostOpen] = useState(false);
    const { isSignedIn, user } = useUser();

    const email = user?.primaryEmailAddress?.emailAddress.toLowerCase();
    const canPost = email?.endsWith("@uwo.ca");
    const postButtonClass = "rounded-2xl bg-[#DA7625] px-6 py-5 w-48 text-xl font-semibold text-white shadow-md transition hover:scale-105";




  return (
    <section className="mx-auto flex min-h-[85vh] max-w-7xl items-center justify-between px-16">
      <div>
        <h1 className="text-6xl font-bold leading-tight text-[#ff9d00]">
          Let <span className="text-[#DA7625]">Timbi</span> find your
          <br />
          next meal
        </h1>

  <div className="mt-8 flex gap-4">
  <button onClick={() => {
     document.getElementById("todays-food")
      ?.scrollIntoView({ behavior: "smooth" })
  }} className="rounded-2xl bg-[#ff9d00] px-6 py-5 w-48 text-xl font-semibold text-white shadow-md transition hover:scale-105">
    Find Food
  </button>

{!isSignedIn ? (
  <SignInButton mode="modal">
    <button className={postButtonClass}>
      Post Food
    </button>
  </SignInButton>
) : canPost ? (
    <button onClick={() => setIsPostOpen(true)} className={postButtonClass}>
    Post Food
  </button>
)  : (
  <button className={postButtonClass}
    onClick={() => alert("Timbi only accepts posts from @uwo.ca emails :(")}
  >   Post Food
  </button>
)}

</div>
</div>

<div className="pr-12">
   <Timbi size={420} className="scale-x-[-1]" />
 </div>

 <PostFoodModal isOpen = {isPostOpen} onClose={() => setIsPostOpen(false)} onEventCreated={() => {}} />

</section>
    

  );
}