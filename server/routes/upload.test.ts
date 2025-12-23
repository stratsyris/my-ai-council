import { describe, it, expect } from 'vitest';

describe('Filename Sanitization', () => {
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.\-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-\./g, '.');
  };

  it('should remove spaces from filename', () => {
    const result = sanitizeFileName('new version ai hub design.jpg');
    expect(result).toBe('new-version-ai-hub-design.jpg');
  });

  it('should remove special characters like colons', () => {
    const result = sanitizeFileName('new version ai hub design : mobile.jpg');
    expect(result).toBe('new-version-ai-hub-design-mobile.jpg');
  });

  it('should convert to lowercase', () => {
    const result = sanitizeFileName('MyImage.JPG');
    expect(result).toBe('myimage.jpg');
  });

  it('should handle multiple consecutive special characters', () => {
    const result = sanitizeFileName('image:::with:::colons.jpg');
    expect(result).toBe('image-with-colons.jpg');
  });

  it('should preserve dots in file extension', () => {
    const result = sanitizeFileName('my-image.png');
    expect(result).toBe('my-image.png');
  });

  it('should handle multiple dots', () => {
    const result = sanitizeFileName('my.image.file.png');
    expect(result).toBe('my.image.file.png');
  });

  it('should not start or end with hyphens', () => {
    const result = sanitizeFileName('---image---.jpg');
    expect(result).toBe('image.jpg');
  });

  it('should handle parentheses', () => {
    const result = sanitizeFileName('image(1).jpg');
    expect(result).toBe('image-1.jpg');
  });

  it('should handle real-world filename with spaces and special chars', () => {
    const result = sanitizeFileName('Mortgage Mastery: Processor Hub (LN-005).jpg');
    expect(result).toBe('mortgage-mastery-processor-hub-ln-005.jpg');
  });
});
