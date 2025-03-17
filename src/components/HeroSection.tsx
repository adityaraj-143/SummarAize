import React from "react";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";

const HeroSection = () => {
  return (
    <div className="text-white text-center flex flex-col items-center justify-center">
      <h1 className="text-3xl md:text-7xl font-bold max-w-6xl">
        Transform PDFs into Smart Summaries with AI!
      </h1>
      <p className="max-w-lg md:text-xl mt-4 text-center">
        Upload your PDFs and let AI generate concise, accurate summaries in
        seconds. Save time, stay informed!
      </p>
      <div className="flex mt-4">
        <div className="relative p-[1px] overflow-hidden rounded-full bg-linear-to-r from-[#7aeef7]  to-[#006786] animate-gradient-x group">
          <Badge variant={"secondary"} className="relative px-6 py-2 text-base font-medium bg-black/[0.96] group-hover:bg-black/[0.55] rounded-full transition-colors">
            <Sparkles style={{width: "24px", height: "24px"}} className="mr-2 text-[#3DC2EC] animate-pulse" />
            <p className="text-white">Powered By AI</p>
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
