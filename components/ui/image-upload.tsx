"use client"

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast"; // Assuming useToast is available
import { Loader2, UploadCloud, CheckCircle, AlertTriangle } from "lucide-react";

interface ImageUploadProps {
  uploadUrl: string;
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: string) => void;
  buttonText?: string;
  allowedFileTypes?: string[]; // e.g., ["image/jpeg", "image/png"]
  maxFileSizeMB?: number; // Max file size in MB
}

export function ImageUpload({
  uploadUrl,
  onUploadSuccess,
  onUploadError,
  buttonText = "Upload Image",
  allowedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxFileSizeMB = 5,
}: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!allowedFileTypes.includes(selectedFile.type)) {
        setError(`Invalid file type. Please select one of: ${allowedFileTypes.join(", ")}`);
        setFile(null);
        return;
      }
      if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxFileSizeMB}MB.`);
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || `Upload failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }

      setSuccessMessage(result.message || "Upload successful!");
      toast({
        title: "Success!",
        description: result.message || `Image uploaded successfully to ${result.filePath || uploadUrl}`,
        variant: "default",
        action: <CheckCircle className="text-green-500" />,
      });
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      setFile(null); // Clear file input after successful upload
      // Clear the actual input field
      const fileInput = event.target as HTMLFormElement;
      fileInput.reset();

    } catch (err: any) {
      const errorMessage = err.message || "An unknown error occurred during upload.";
      setError(errorMessage);
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
        action: <AlertTriangle className="text-red-500" />,
      });
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow">
      <div>
        <label htmlFor="file-upload" className="sr-only">Choose file</label>
        <Input
          id="file-upload"
          type="file"
          accept={allowedFileTypes.join(",")}
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-pink-50 file:text-pink-700
                     hover:file:bg-pink-100"
        />
      </div>

      {file && (
        <div className="text-sm text-gray-600">
          Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" /> {error}
        </p>
      )}
      {successMessage && (
         <p className="text-sm text-green-600 flex items-center">
           <CheckCircle className="h-4 w-4 mr-2" /> {successMessage}
         </p>
      )}

      <Button type="submit" disabled={isUploading || !file} className="w-full">
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="mr-2 h-4 w-4" />
        )}
        {isUploading ? "Uploading..." : buttonText}
      </Button>
    </form>
  );
}
