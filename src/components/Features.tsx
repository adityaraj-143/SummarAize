import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, MessageCircle } from "lucide-react";

const features = [
  {
    title: "AI-Powered Summaries",
    description: "Upload your PDFs and get concise, accurate summaries instantly.",
    icon: FileText,
  },
  {
    title: "Flashcard Generation",
    description: "Convert your summaries into interactive flashcards for better retention.",
    icon: Sparkles,
  },
  {
    title: "AI Q&A Assistance",
    description: "Ask AI questions based on your summaries or flashcards for deeper understanding.",
    icon: MessageCircle,
  },
];

export default function Features() {
  return (
    <section className="mt-10 py-12 px-6 bg-transparent text-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white">Our Features</h2>
        <p className="mt-2 text-gray-400">Empowering you with AI-driven tools for better learning and efficiency.</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="shadow-lg rounded-2xl p-6 bg-gray-900 border border-cyan-400 hover:bg-gray-800 transition duration-300 transform hover:scale-105 hover:shadow-cyan-400/50"
          >
            <CardHeader className="flex items-center space-x-4">
              <feature.icon className="w-10 h-10 text-cyan-400" />
              <CardTitle className="text-xl font-semibold text-white">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
