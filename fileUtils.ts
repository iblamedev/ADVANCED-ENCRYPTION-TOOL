// File utility functions

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const getMimeType = (filename: string): string => {
  const extension = getFileExtension(filename).toLowerCase();
  
  const mimeTypes: { [key: string]: string } = {
    'txt': 'text/plain',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'zip': 'application/zip',
    'json': 'application/json',
    'xml': 'application/xml',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

export const isValidFileSize = (file: File, maxSizeInMB: number = 50): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const sanitizeFilename = (filename: string): string => {
  // Remove or replace invalid characters for file names
  return filename.replace(/[<>:"/\\|?*]/g, '_');
};