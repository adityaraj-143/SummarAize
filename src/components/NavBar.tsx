"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Sparkles } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1
              className="gradient-text cursor-pointer text-2xl font-bold transition-opacity hover:opacity-80"
              onClick={() => router.push("/")}
            >
              SummarAIze
            </h1>
            {isDashboard ? (
              <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary">
                Dashboard
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="animate-fade-in border-primary/20 bg-primary/10 text-primary"
              >
                <Sparkles className="mr-1 size-4" />
                Powered By AI
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4 ">
            {!isDashboard ? (
              <>
                <SignedIn>
                  <Button
                    variant="default"
                    onClick={() => router.push("/dashboard")}
                    className="cursor-pointer bg-primary/80 transition-transform hover:scale-105 hover:bg-primary/80 active:scale-95"
                  >
                    Dashboard
                  </Button>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <Link href={"/sign-up"}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer border-primary/20 transition-transform hover:scale-105 active:scale-95"
                    >
                      <User className="mr-2 size-4" />
                      Sign Up
                    </Button>
                  </Link>
                </SignedOut>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/")}
                  className="transition-transform hover:scale-105 hover:bg-primary/10 active:scale-95"
                >
                  Home
                </Button>
                <Button className="btn-primary transition-transform hover:scale-105 active:scale-95">
                  <Plus className="mr-2 size-4" />
                  New Summary
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
