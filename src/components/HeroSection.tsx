"use client";

import { useState } from "react";
import Timbi from "./Timbi";
import TimbiTitle from "./TimbiTitle";
import PostFoodModal from "./PostFoodModal";
import { SignInButton, useUser } from "@clerk/nextjs";

type HeroSectionProps = {
  onEventCreated: () => Promise<void>;
}

export default function HeroSection({ onEventCreated }: HeroSectionProps) {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress.toLowerCase();
  const canPost = email?.endsWith("@uwo.ca");
  const postButtonClass =
    "rounded-2xl bg-[#DA7625] px-6 py-4 sm:py-5 w-full sm:w-48 text-lg sm:text-xl font-semibold text-white shadow-md transition hover:scale-105";

  return (
    <section className="mx-auto flex min-h-[70vh] sm:min-h-[85vh] max-w-7xl flex-col-reverse items-center justify-center gap-8 px-6 py-12 text-center sm:flex-row sm:justify-between sm:px-16 sm:py-0 sm:text-left">
      <div className="flex flex-col items-center sm:items-start">
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-[#FFA353]">
          Let <span className="text-[#DA7625]">Timbi</span> find your
          <br className="hidden sm:block" />{" "}
          next meal
        </h1>

        <div className="mt-6 sm:mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
          <button
            onClick={() => {
              document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="rounded-2xl bg-[#FFA353] px-6 py-4 sm:py-5 w-full sm:w-48 text-lg sm:text-xl font-semibold text-white shadow-md transition hover:scale-105"
          >
            Find Food
          </button>

          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className={postButtonClass}>Post Food</button>
            </SignInButton>
          ) : canPost ? (
            <button onClick={() => setIsPostOpen(true)} className={postButtonClass}>
              Post Food
            </button>
          ) : (
            <button
              className={postButtonClass}
              onClick={() => alert("Timbi only accepts posts from @uwo.ca emails :(")}
            >
              Post Food
            </button>
          )}
        </div>
      </div>

      <div className="sm:pr-12">
        <Timbi size={200} className="scale-x-[-1] sm:hidden" />
        <Timbi size={420} className="hidden scale-x-[-1] sm:block" />
      </div>

      <PostFoodModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        onEventCreated={onEventCreated}
      />
    </section>
  );
}