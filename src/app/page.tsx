"use client";

import HeroSection from "@/components/HeroSection";
import FormUpload from "@/components/upload/formUpload";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <HeroSection />
      </div>

      {/* Upload Section */}
      <div className="container mx-auto px-4">
        <FormUpload />
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4">
        <HowItWorks />
      </div>

      {/* Features */}
      <Features />

      {/* Footer */}
      <Footer />
    </>
  );
};

export default Index;
