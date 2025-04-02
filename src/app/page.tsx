import Features from "@/components/Features";
import HeroSection from "@/components/HeroSection";
import FormUpload from "@/components/upload/formUpload";

export default function Home() {
  return (
    <div className=" flex flex-col justify-center items-center mt-20">
      <HeroSection/>
      <FormUpload/>
      <Features/>
    </div>
  )
}