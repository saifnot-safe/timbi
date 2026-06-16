"use client";

import { useState } from "react";
import PostFoodModal from "./PostFoodModal";
import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

type EmptyStateProps = {
  onEventCreated: () => Promise<void>;
};

export default function EmptyState({ onEventCreated }: EmptyStateProps) {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress.toLowerCase();
  const canPost = email?.endsWith("@uwo.ca");

  const postButtonClass =
    "rounded-2xl bg-[#DA7625] px-6 py-4 w-44 text-lg font-semibold text-white shadow-md transition hover:scale-105";

  return (
    <section className="mx-auto max-w rounded-3xl border-4 border-dashed border-[#d8b68c] bg-[#fff4e4] px-8 py-10 text-center">
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/timbi/sad-timbi.png"
          alt="Sad Timbi"
          width={230}
          height={230}
          className="mb-3"
        />

        <h2 className="max-w-3xl text-3xl font-bold leading-tight text-[#ff9d00] md:text-5xl">
          Timbi found no food right now
        </h2>

        <p className="mt-3 text-lg font-semibold text-[#8c6a4f]">
          Be the first to post the next event
        </p>

        <div className="mt-6">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className={postButtonClass}>Post Food</button>
            </SignInButton>
          ) : canPost ? (
            <button
              onClick={() => setIsPostOpen(true)}
              className={postButtonClass}
            >
              Post Food
            </button>
          ) : (
            <button
              className={postButtonClass}
              onClick={() =>
                alert("Timbi only accepts posts from @uwo.ca emails :(")
              }
            >
              Post Food
            </button>
          )}
        </div>
      </div>

      <PostFoodModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        onEventCreated={onEventCreated}
      />
    </section>
  );
}