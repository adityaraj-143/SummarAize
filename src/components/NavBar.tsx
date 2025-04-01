"use client";

import {
  SignedIn,
  SignedOut,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

const NavBar = () => {

  return (
    <>
      <div className="flex md:text-[16px] gap-7 md:gap-48 border-1 border-white/[0.2] text-white py-5 px-10 md:px-16 rounded-full justify-between items-center ">
        <Link href={"/"}>
          <h1 className="font-bold text-[18px]">
            Summar<span className="text-[#3DC2EC]">AI</span>ze
          </h1>
        </Link>
        <SignedIn>
          <Link href={"/dashboard"}>
            <p>Dashboard</p>
          </Link>
        </SignedIn>
        <div>
            <SignedIn>
              <UserButton appearance={{
                elements: {
                  avatarBox: 'translate-y-1'
                }
              }}/>
            </SignedIn>
            <SignedOut>
              <Link href={"/sign-up"}>
                Sign Up
              </Link>
            </SignedOut>
        </div>
      </div>

    </>
  );
};

export default NavBar;
