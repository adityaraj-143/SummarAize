"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface FormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const FormInput = ({ onSubmit }: FormInputProps) => {

  return (
    <form onSubmit={onSubmit} className=" flex flex-col gap-6 text-white">
      <div className="flex justify-end items-center gap-1.5">
        <Input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          required
          className="file:text-white"
        />
        <Button>Upload your PDF</Button>
      </div>
    </form>
  );
};

export default FormInput;
