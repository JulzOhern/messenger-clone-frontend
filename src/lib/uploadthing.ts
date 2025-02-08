import { generateUploadButton, } from "@uploadthing/react";
import { genUploader } from "uploadthing/client";

export const UploadButton = generateUploadButton({
  url: `${import.meta.env.VITE_SERVER_BASE_URL}/api/uploadthing`,
});

export const { uploadFiles } = genUploader<any>({
  url: `${import.meta.env.VITE_SERVER_BASE_URL}/api/uploadthing`
} as any);