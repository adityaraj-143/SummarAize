import { z } from 'zod';

export const uploadSchema = z.object({
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

export type UploadSchema = z.infer<typeof uploadSchema>;

export interface Chat {
  id: number;
  pdf_name: string;
  pdf_url: string;
  created_at: string; // or Date, depending on how you handle timestamps
  user_id: string;
  file_key: string;
  summary_id: string;
}
