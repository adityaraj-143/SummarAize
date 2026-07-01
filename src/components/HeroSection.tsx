"use client";

import { FileText, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

const HeroSection = () => {
  return (
    <div className="relative mx-auto max-w-5xl text-center">
      {/* Background glow orb */}
      <div className="hero-glow absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4" />

      {/* Floating decorative icons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FileText
          className="absolute left-[8%] top-[15%] size-8 text-primary/15 animate-float"
          style={{ animationDelay: "0s" }}
        />
        <Sparkles
          className="absolute right-[10%] top-[10%] size-7 text-primary/20 animate-float"
          style={{ animationDelay: "1s" }}
        />
        <Zap
          className="absolute left-[15%] bottom-[20%] size-6 text-primary/10 animate-float"
          style={{ animationDelay: "0.5s" }}
        />
        <FileText
          className="absolute right-[12%] bottom-[25%] size-9 text-primary/10 animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Main heading */}
      <h1 className="relative mb-6 animate-slide-up text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
        Upload. Summarize. <br className="hidden sm:block" />
        <span className="gradient-text">Chat</span> with Your PDFs.
      </h1>

      {/* Subtitle */}
      <p
        className="relative mx-auto mb-8 max-w-2xl animate-slide-up text-lg text-muted-foreground md:text-xl"
        style={{ animationDelay: "0.15s" }}
      >
        Upload any PDF — digital, scanned, or handwritten — and get a structured,
        topic-organized summary in under a minute. Then ask follow-up questions and
        get AI-powered answers grounded in your actual document.
      </p>

      {/* CTA buttons */}
      <div
        className="relative mb-8 flex animate-slide-up flex-col items-center justify-center gap-4 sm:flex-row"
        style={{ animationDelay: "0.3s" }}
      >
        <SignedOut>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="btn-primary group px-8 text-base font-semibold transition-transform hover:scale-105 active:scale-95"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="btn-primary group px-8 text-base font-semibold transition-transform hover:scale-105 active:scale-95"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </SignedIn>
      </div>

      {/* Stats bar */}
      <div
        className="relative mx-auto flex animate-slide-up flex-wrap items-center justify-center gap-6 sm:gap-10"
        style={{ animationDelay: "0.45s" }}
      >
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">Scanned & Handwritten</span> Support
          </span>
        </div>
        <div className="hidden h-4 w-px bg-border sm:block" />
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">~30s</span> Average
          </span>
        </div>
        <div className="hidden h-4 w-px bg-border sm:block" />
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">Source-Grounded</span> Answers
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
