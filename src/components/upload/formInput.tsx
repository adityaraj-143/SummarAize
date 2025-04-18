"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const FormInput = ({ onSubmit, isLoading }: FormInputProps) => {
  return (
    <form onSubmit={onSubmit} className=" flex flex-col gap-6 text-white">
      <div className="flex justify-end items-center gap-1.5 ">
        <Input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          required
          className={cn(isLoading ? "opacity-50 cursor-not-allowed file:text-white" : "file:text-white")}
          disabled={isLoading}
        />
        <Button disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Upload your PDF"
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormInput;
