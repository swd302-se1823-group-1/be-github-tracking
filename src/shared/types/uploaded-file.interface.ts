/**
 * Interface for uploaded file (matches Express.Multer.File structure)
 * This ensures type compatibility with NestJS file uploads
 */
export interface UploadedFile {
  /** Field name specified in the form */
  fieldname: string;
  /** Name of the file on the user's computer */
  originalname: string;
  /** Encoding type of the file */
  encoding: string;
  /** Mime type of the file */
  mimetype: string;
  /** Size of the file in bytes */
  size: number;
  /** A Buffer of the entire file */
  buffer: Buffer;
  /** DiskStorage only: Directory where the file has been saved */
  destination?: string;
  /** DiskStorage only: Name of the file within the destination */
  filename?: string;
  /** DiskStorage only: Full path to the uploaded file */
  path?: string;
  /** MemoryStorage only: A stream.Readable of the file */
  stream?: NodeJS.ReadableStream;
}
