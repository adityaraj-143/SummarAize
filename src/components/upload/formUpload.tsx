"use client";

import type React from "react";
import { toast } from "sonner";
import { useUploadThing } from "@/utils/uploadthing";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { formatFileName } from "@/utils/format-file";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, Zap, Loader2, Check } from "lucide-react";
import { uploadSchema } from "@/lib/db/schema";

type PdfType = "digital" | "scanned";
type UploadStep = "idle" | "uploading" | "analyzing" | "generating";

/* ── Progress Steps Component ── */
const ProgressSteps = ({ currentStep }: { currentStep: UploadStep }) => {
  const steps = [
    { key: "uploading", label: "Uploading PDF", description: "Sending your file securely..." },
    { key: "analyzing", label: "Analyzing Document", description: "Reading and parsing content..." },
    { key: "generating", label: "Generating Summary", description: "AI is creating your summary..." },
  ] as const;

  const stepOrder = ["uploading", "analyzing", "generating"] as const;
  const currentIndex = stepOrder.indexOf(currentStep as (typeof stepOrder)[number]);

  return (
    <div className="py-4">
      <div className="mb-8 space-y-5">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex items-center gap-4">
              {/* Step indicator */}
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary bg-primary/10 text-primary animate-pulse-glow"
                      : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : isActive ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Step text */}
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isActive
                      ? "text-foreground"
                      : isCompleted
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    isPending ? "text-muted-foreground/50" : "text-muted-foreground"
                  }`}
                >
                  {step.description}
                </p>
              </div>

              {/* Status */}
              {isCompleted && (
                <span className="animate-fade-in text-xs font-medium text-primary">Done</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700 ease-out"
          style={{
            width:
              currentStep === "uploading"
                ? "20%"
                : currentStep === "analyzing"
                  ? "55%"
                  : "85%",
          }}
        />
      </div>
    </div>
  );
};

/* ── Main FormUpload Component ── */
const FormUpload = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfType, setPdfType] = useState<PdfType>("digital");
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle");

  const { mutate } = useMutation({
    mutationFn: async ({
      fileKey,
      fileName,
      fileUrl,
      pdfType,
    }: {
      fileKey: string;
      fileName: string;
      fileUrl: string;
      pdfType: PdfType;
    }) => {
      const res = await axios.post("/api/create-chat", {
        fileKey,
        fileName,
        fileUrl,
        pdfType,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success && data.chat_id) {
        toast.success("Chat created!");
        console.log("chat ID: ", data.chat_id);
        router.push(`/chat/${data.chat_id}`);
      } else {
        toast.error(data.message || "Failed to create chat");
      }
      setIsLoading(false);
      setUploadStep("idle");
    },
    onError: () => {
      toast.error("Chat creation failed.");
      setIsLoading(false);
      setUploadStep("idle");
    },
  });

  const { startUpload } = useUploadThing("pdfUploader", {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (!selectedFile) {
        toast.error("Please select a file");
        setIsLoading(false);
        return;
      }

      await uploadSchema.parseAsync({ file: selectedFile });

      setUploadStep("uploading");
      toast.success("Uploading PDF", {
        description: "We are uploading your PDF",
      });

      const resp = await startUpload([selectedFile]);
      if (!resp) {
        toast.error("Something went wrong!", {
          description: "Please re-upload the file or use different file",
        });
        setIsLoading(false);
        setUploadStep("idle");
        return;
      }

      setUploadStep("analyzing");

      console.log("Response of uploadthing: ", resp[0]);
      const { key: fileKey, name: pdfName, ufsUrl: fileUrl } = resp[0];
      const fileName = formatFileName(pdfName);

      setUploadStep("generating");

      mutate({
        fileKey,
        fileName,
        fileUrl,
        pdfType,
      });
    } catch (error) {
      setIsLoading(false);
      setUploadStep("idle");
      console.log("Error occured: ", error);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card
      className="card-gradient animate-scale-in mx-auto mb-12 max-w-2xl"
      style={{ animationDelay: "0.4s" }}
    >
      <CardContent className="px-8 py-3">
        <h2 className="mb-6 text-center text-2xl font-semibold">Upload Your PDF</h2>

        {/* ── Progress View (when loading) ── */}
        {isLoading && uploadStep !== "idle" ? (
          <div className="animate-fade-in">
            {/* File info bar */}
            {selectedFile && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <FileText className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            <ProgressSteps currentStep={uploadStep} />
          </div>
        ) : (
          /* ── Normal Upload View ── */
          <form onSubmit={handleSubmit}>
            {/* File Drop Zone */}
            <div
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="size-7 text-primary" />
              </div>
              <p className="mb-2 text-lg font-medium">Drop your PDF here or click to browse</p>
              <p className="mb-4 text-sm text-muted-foreground">Supports PDF files up to 20MB</p>

              <input
                type="file"
                accept=".pdf"
                ref={inputRef}
                onChange={handleFileSelect}
                style={{ display: "none" }}
                disabled={isLoading}
              />

              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border-primary/20 bg-transparent transition-transform hover:scale-105 active:scale-95"
                disabled={isLoading}
                onClick={handleClick}
              >
                Choose File
              </Button>
            </div>

            {/* PDF Type Selector */}
            {selectedFile && (
              <div className="mt-4 flex animate-fade-in items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">PDF Type:</span>
                <button
                  type="button"
                  onClick={() => setPdfType("digital")}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    pdfType === "digital"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Digital (text + images)
                </button>
                <button
                  type="button"
                  onClick={() => setPdfType("scanned")}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    pdfType === "scanned"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Scanned / Handwritten
                </button>
              </div>
            )}

            {/* Selected File Display */}
            {selectedFile && (
              <div className="mt-6 animate-slide-up rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="btn-primary transition-transform hover:scale-105 active:scale-95"
                    disabled={isLoading}
                  >
                    <Zap className="mr-2 size-4" />
                    Generate Summary
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default FormUpload;
