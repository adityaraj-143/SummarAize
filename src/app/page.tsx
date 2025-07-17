"use client"

import { useState } from "react"
import HeroSection from "@/components/HeroSection"
import FormUpload from "@/components/upload/formUpload"
import Features from "@/components/Features"

const Index = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <HeroSection />

        {/* Upload Section */}
        <FormUpload />

        {/* Features */}
        <Features />
      </div>
    </>
  )
}

export default Index
