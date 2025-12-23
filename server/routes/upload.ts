import { Router, Request, Response } from 'express';
import multer from 'multer';
import { storagePut } from '../storage';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

interface MulterRequest extends Request {
  file?: any;
}

/**
 * POST /api/upload-image
 * Upload an image file to S3 and return the URL
 */
router.post('/upload-image', upload.single('file'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const fileBuffer = req.file.buffer;

    // Sanitize filename: remove spaces, special characters, keep only alphanumeric, dots, hyphens
    const sanitizedFileName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9.\-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-\./g, '.');

    // Generate a unique key for the file
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileKey = `images/${timestamp}-${randomStr}-${sanitizedFileName}`;

    // Upload to S3
    console.log(`[Upload] Uploading image: ${fileKey}`);
    const { url } = await storagePut(fileKey, fileBuffer, mimeType);

    console.log(`[Upload] Image uploaded successfully: ${fileKey} -> ${url}`);
    res.json({ url });
  } catch (error) {
    console.error('[Upload] Image upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
