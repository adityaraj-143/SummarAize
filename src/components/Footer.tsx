import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span className="gradient-text text-xl font-bold">SummarAIze</span>
            <p className="text-sm text-muted-foreground">AI-powered PDF summarization & chat</p>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Built with AI
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SummarAIze. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
