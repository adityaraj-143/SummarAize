import { ClientUploadedFileData } from "uploadthing/types";

export type UploadResponse = ClientUploadedFileData<{
  uploadedBy: string;
  fileName: string;
}>[] | undefined;
