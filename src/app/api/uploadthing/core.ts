import { currentUser } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const OurFileRouter = {

    pdfUploader: f({
        pdf: {
            maxFileCount: 1,
            maxFileSize: '32MB'
        }
    })
    .middleware(async (req) => {
        const user = await currentUser();

        if(!user) throw new UploadThingError("Unauthorized");

        return {userId: user.id};
    })
    .onUploadComplete(async ({metadata, file}) => {
        console.log("Upload completed for userId: ", metadata.userId)
        console.log("File url: ",file.ufsUrl);

        return {uploadedBy: metadata.userId, file: file.ufsUrl}
    })
    
} satisfies FileRouter

export type OurFileRouter = typeof OurFileRouter