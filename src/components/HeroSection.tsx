import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

const HeroSection = () => {
  return (
    <div className="text-center max-w-4xl mx-auto">

      <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
        Transform PDFs into Smart{" "}
        <span className="gradient-text">Summaries</span>{" "}
        with AI!
      </h1>

      <p
        className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        Upload your PDFs and let AI generate concise, accurate summaries in seconds. Save time, stay informed!
      </p>
    </div>
  )
}

export default HeroSection
