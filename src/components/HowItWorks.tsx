"use client";

import { Upload, Cpu, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your PDF",
    description:
      "Drag & drop or browse to upload any PDF document — research papers, reports, legal docs, and more.",
  },
  {
    icon: Cpu,
    title: "AI Analyzes & Summarizes",
    description:
      "Our AI reads every page, extracts key insights, and generates a clear, structured summary in seconds.",
  },
  {
    icon: MessageSquare,
    title: "Chat & Explore",
    description:
      "Ask questions about your document, dive deeper into specific sections, and get instant AI-powered answers.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl text-center">
        {/* Section heading */}
        <h2
          className="mb-4 animate-slide-up text-3xl font-bold md:text-4xl"
          style={{ animationDelay: "0.1s" }}
        >
          How It <span className="gradient-text">Works</span>
        </h2>
        <p
          className="mx-auto mb-16 max-w-xl animate-slide-up text-muted-foreground"
          style={{ animationDelay: "0.2s" }}
        >
          Three simple steps to go from raw PDF to actionable insights
        </p>

        {/* Steps */}
        <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {/* Connecting line (desktop only) */}
          <div className="absolute left-[20%] right-[20%] top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

          {steps.map((step, index) => (
            <div
              key={step.title}
              className="animate-slide-up relative flex flex-col items-center"
              style={{ animationDelay: `${0.3 + index * 0.15}s` }}
            >
              {/* Step number badge */}
              <div className="mb-4 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </div>

              {/* Icon container */}
              <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-all duration-300 hover:border-primary/40 hover:animate-pulse-glow">
                <step.icon className="size-7 text-primary" />
              </div>

              {/* Text */}
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
