import { nanoid } from "nanoid";
import { storagePut, storageGet } from "../storage";

/**
 * Document service for handling file uploads and text extraction
 */
export class DocumentService {
  /**
   * Upload a document to S3 and store metadata in database
   */
  async uploadDocument(
    file: {
      name: string;
      type: string;
      size: number;
      data: Buffer;
    },
    conversationId: string,
    userId: number
  ) {
    // Validate file type
    const allowedTypes = ["text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum of 10MB`);
    }

    // Generate unique key for S3
    const fileExt = this.getFileExtension(file.name);
    const s3Key = `documents/${userId}/${conversationId}/${nanoid()}-${file.name}`;

    // Upload to S3
    const { url: s3Url } = await storagePut(s3Key, file.data, file.type);

    // Extract text from document (simplified - would need pdf-parse, docx-parser, etc.)
    let extractedText = "";
    if (file.type === "text/plain") {
      extractedText = file.data.toString("utf-8");
    } else {
      // For PDF and DOCX, we'd need additional libraries
      // For now, store placeholder
      extractedText = `[Document content from ${file.name} - requires parsing library]`;
    }

    return {
      id: nanoid(),
      conversationId,
      userId,
      fileName: file.name,
      fileType: fileExt,
      s3Key,
      s3Url,
      extractedText,
      fileSize: file.size,
    };
  }

  /**
   * Get a presigned URL for downloading a document
   */
  async getDocumentUrl(s3Key: string) {
    return storageGet(s3Key);
  }

  /**
   * Extract file extension from filename
   */
  private getFileExtension(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() || "unknown";
    const typeMap: Record<string, string> = {
      pdf: "pdf",
      txt: "txt",
      docx: "docx",
      doc: "docx",
    };
    return typeMap[ext] || ext;
  }

  /**
   * Format document for council evaluation
   */
  formatDocumentForCouncil(document: { fileName: string; extractedText: string }): string {
    return `
Document: ${document.fileName}

Content:
${document.extractedText}
`;
  }
}
