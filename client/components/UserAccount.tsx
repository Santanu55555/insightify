"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function UserAccount() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200" />;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            {session.user?.name}
          </p>
          <button
            onClick={() => signOut()}
            className="text-xs font-medium text-zinc-500 hover:text-indigo-600 transition-colors"
          >
            Sign out
          </button>
        </div>
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User avatar"}
            width={32}
            height={32}
            className="rounded-full ring-2 ring-indigo-50"
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
    >
      Sign in
    </button>
  );
}
