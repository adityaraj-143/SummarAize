"use client"

import type React from "react"

import { toast } from "sonner"
import { z } from "zod"
import { useUploadThing } from "@/utils/uploadthing"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"
import { formatFileName } from "@/utils/format-file"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Upload, Zap, Loader2 } from "lucide-react"

interface ChatInfo {
  chat_id: string
  summary_id: string
}

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid File" })
    .refine((file) => file.size <= 20 * 1024 * 1024, "File size must be less than 20MB")
    .refine((file) => file.type.startsWith("application/pdf"), "File must be a PDF"),
})

const FormUpload = () => {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { mutate } = useMutation({
    mutationFn: async ({
      fileKey,
      fileName,
      fileUrl,
    }: {
      fileKey: string
      fileName: string
      fileUrl: string
    }) => {
      const res = await axios.post("/api/create-chat", {
        fileKey,
        fileName,
        fileUrl,
      })
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        setChatInfo({
          chat_id: data.chat_id,
          summary_id: data.sumarry_id,
        })
        toast.success("Chat created!")
        // router.push(`/chat/${data.chat_id}`);
      } else {
        toast.error(data.message)
      }
      setIsLoading(false)
    },
    onError: (error: Error) => {
      toast.error("Chat creation failed.")
      setIsLoading(false)
    },
  })

  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      console.log("uploaded successfully!")
      toast.success("File uploaded successfully")
    },
    onUploadError: (err) => {
      console.log("error occurred while uploading", err)
      toast.error("Error uploading file")
    },
    onUploadBegin: (file) => {
      console.log("upload has begun for", file)
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      if (!selectedFile) {
        toast.error("Please select a file")
        setIsLoading(false)
        return
      }

      const validatedFields = schema.safeParse({ file: selectedFile })
      if (!validatedFields.success) {
        toast.error(validatedFields.error.flatten().fieldErrors.file?.[0] ?? "Invalid file")
        setIsLoading(false)
        return
      }

      toast.success("Uploading PDF", {
        description: "We are uploading your PDF",
      })

      const resp = await startUpload([selectedFile])
      if (!resp) {
        toast.error("Something went wrong!", {
          description: "Please re-upload the file or use different file",
        })
        setIsLoading(false)
        return
      }

      console.log("Response of uploadthing: ", resp[0])
      const { key: fileKey, name: pdfName, ufsUrl: fileUrl } = resp[0]
      const fileName = formatFileName(pdfName)

      mutate({
        fileKey,
        fileName,
        fileUrl,
      })
    } catch (error) {
      setIsLoading(false)
      console.log("Error occured: ", error)
    }
  }

  return (
    <Card
      className="max-w-2xl card-gradient mx-auto mb-12 animate-scale-in"
      style={{ animationDelay: "0.4s" }}
    >
      <CardContent className="px-8 py-3">
        <h2 className="text-2xl text-center font-semibold mb-6">Upload Your PDF</h2>
        <form onSubmit={handleSubmit}>
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Drop your PDF here or click to browse</p>
            <p className="text-sm text-muted-foreground mb-4">Supports PDF files up to 20MB</p>

            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
              disabled={isLoading}
            />
            <label htmlFor="pdf-upload">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer border-primary/20 bg-transparent"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Choose File"
                )}
              </Button>
            </label>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Chat Info Display (if needed) */}
        {chatInfo && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Chat created successfully!</p>
            <p className="text-green-600 text-sm">Chat ID: {chatInfo.chat_id}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FormUpload
