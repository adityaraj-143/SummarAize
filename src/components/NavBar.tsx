"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Sparkles } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1
              className="text-2xl font-bold gradient-text cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push("/")}
            >
              SummarAIze
            </h1>
            {isDashboard && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                Dashboard
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Badge className="bg-primary/10 py-2 text-primary border-primary/20 animate-fade-in">
              <Sparkles className="w-4 h-4 mr-1" />
              Powered By AI
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            {!isDashboard ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="hover:bg-primary/10"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/20"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/")}
                  className="hover:bg-primary/10"
                >
                  Home
                </Button>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
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
