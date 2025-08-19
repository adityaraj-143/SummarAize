import { ClientUploadedFileData } from 'uploadthing/types';

export type UploadResponse =
  | ClientUploadedFileData<{
      uploadedBy: string;
      fileName: string;
    }>[]
  | undefined;

export interface SummaryType {
  created_at: string;
  file_name: string;
  id: string;
  original_file_url: string;
  status: string;
  summary_text: string;
  title: string;
  updated_at: string;
  user_id: string;
  category?: string;
}
