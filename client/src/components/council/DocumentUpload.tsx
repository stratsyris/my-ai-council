import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DocumentUploadProps {
  conversationId: string;
  onDocumentUploaded?: () => void;
}

export default function DocumentUpload({ conversationId, onDocumentUploaded }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; fileName: string; fileType: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.council.uploadDocument.useMutation();
  const getDocuments = trpc.council.getDocuments.useQuery({ conversationId });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      // Validate file type
      const allowedTypes = ["text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Unsupported file type: ${file.type}`);
        continue;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds maximum size of 10MB`);
        continue;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        
        try {
          await uploadMutation.mutateAsync({
            conversationId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: base64,
          });

          setUploadedFiles((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              fileName: file.name,
              fileType: file.type,
            },
          ]);

          toast.success(`${file.name} uploaded successfully`);
          onDocumentUploaded?.();
          getDocuments.refetch();
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
          console.error(error);
        }
      };

      reader.readAsDataURL(file);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.pdf,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="w-5 h-5 text-muted-foreground" />
          <div className="text-sm">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="font-semibold text-primary hover:underline"
            >
              Click to upload
            </button>
            {" or drag and drop"}
          </div>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, or TXT (max 10MB)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Uploaded Documents</p>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm"
              >
                <File className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{file.fileName}</span>
                <button
                  onClick={() =>
                    setUploadedFiles((prev) =>
                      prev.filter((f) => f.id !== file.id)
                    )
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading document...</span>
        </div>
      )}
    </div>
  );
}
