"use client";

import { toast } from "sonner";
import { z } from "zod";
import FormInput from "./formInput";
import { useUploadThing } from "@/utils/uploadthing";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { formatFileName } from "@/utils/format-file";

interface ChatInfo {
  chat_id: string;
  summary_id: string;
}

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

const FormUpload = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);

  const { mutate } = useMutation({
    mutationFn: async ({
      fileKey,
      fileName,
      fileUrl,
    }: {
      fileKey: string;
      fileName: string;
      fileUrl: string;
    }) => {
      const res = await axios.post("/api/create-chat", {
        fileKey,
        fileName,
        fileUrl,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setChatInfo({
          chat_id: data.chat_id,
          summary_id: data.sumarry_id,
        });
        toast.success("Chat created!");
        // router.push(`/chat/${data.chat_id}`);
      } else {
        toast.error(data.message);
      }
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast.error("Chat creation failed.");
      setIsLoading(false);
    },
  });

  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("uploaded successfully!");
      toast.success("File uploaded successfully");
    },
    onUploadError: (err) => {
      console.log("error occurred while uploading", err);
      toast.error("Error uploading file");
    },
    onUploadBegin: (file) => {
      console.log("upload has begun for", file);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const formdata = new FormData(e.currentTarget);
      const file = formdata.get("file") as File;

      const validatedFields = schema.safeParse({ file });

      if (!validatedFields.success) {
        toast.error(
          validatedFields.error.flatten().fieldErrors.file?.[0] ??
            "Invalid file"
        );
        setIsLoading(false);
        return;
      }

      toast.success("Uploading PDF", {
        description: "We are uploading your PDF",
      });

      const resp = await startUpload([file]);
      if (!resp) {
        toast.error("Something went wrong!", {
          description: "Please re-upload the file or use different file",
        });
        setIsLoading(false);
        return;
      }
      console.log("Response of uploadthing: ", resp[0]);

      const { key: fileKey, name: pdfName, ufsUrl: fileUrl } = resp[0];
      const fileName = formatFileName(pdfName)

      mutate({
        fileKey,
        fileName,
        fileUrl,
      })

      // router.push(`/summaries/${result.id}`);
    } catch (error) {
      setIsLoading(false);
      console.log("Error occured: ", error);
    }
  };

  return (
    <div className="mt-15 flex flex-col gap-5 w-full max-w-2xl mx-auto">
      <h1 className="text-2xl mb-30 text-white text-center">Upload Your PDF</h1>
      <FormInput isLoading={isLoading} onSubmit={handleSubmit} />
    </div>
  );
};
export default FormUpload;
