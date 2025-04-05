"use client";

import { toast } from "sonner";
import { z } from "zod";
import FormInput from "./formInput";
import { useUploadThing } from "@/utils/uploadthing";
import { generatePdfSummary } from "../../../actions/upload-action";
import { FetchSummary } from "@/lib/gemini";

const FormUpload = () => {
  const schema = z.object({
    file: z
      .instanceof(File, { message: "Invalid File" })
      .refine(
        (file) => file.size <= 20 * 1024 * 1024,
        "File size must be less than 20MB"
      )
      .refine(
        (file) => file.type.startsWith("application/pdf"),
        "File must be a PDF"
      ),
  });

  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("uploaded successfully!");
      toast.success('File uploaded successfully')
    },
    onUploadError: (err) => {
      console.log("error occurred while uploading", err);
      toast.error("Error uploading file")
    },
    onUploadBegin: (file) => {
      console.log("upload has begun for", file);

    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formdata = new FormData(e.currentTarget);
    const file = formdata.get("file") as File;

    const validatedFields = schema.safeParse({ file });

    if (!validatedFields.success) {
      toast.error(
        validatedFields.error.flatten().fieldErrors.file?.[0] ?? "Invalid file"
      );
      return;
    }
    
    toast.success("Uploading PDF", {
      description: "We are uploading your PDF"
    })

    const resp = await startUpload([file]);
    if(!resp) {
      console.log("abc");
      
      toast.error("Something went wrong!", {
        description: "Please re-upload the file or use different file"
      })
      return;
    }

    toast.success("Processing PDF", {
      description: "Hang tight! Our Ai is reading through your PDF"
    })

    const summary = await generatePdfSummary(resp);
    console.log({summary})


  };

  return (
    <div className="mt-15 flex flex-col gap-5 w-full max-w-2xl mx-auto">
      <h1 className="text-2xl mb-30 text-white text-center">Upload Your PDF</h1>
      <FormInput onSubmit={handleSubmit} />
    </div>
  );
};

export default FormUpload;
