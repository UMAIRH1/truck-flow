// Cloudinary configuration for direct uploads
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dearf6hnw';
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'truck-flow';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload image or document directly to Cloudinary
 * This can be used as a fallback if backend upload fails
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  // Determine upload type and file extension
  const isImage = file.type.startsWith('image/');
  const uploadType = isImage ? 'image' : 'raw';
  
  // Get file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  
  console.log('Uploading to Cloudinary:', { 
    fileName: file.name, 
    fileType: file.type, 
    uploadType,
    extension: fileExtension,
    cloudName: CLOUDINARY_CLOUD_NAME,
    preset: CLOUDINARY_UPLOAD_PRESET
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${uploadType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error response:', errorData);
      
      if (uploadType === 'raw') {
        console.error('Raw file upload failed. Please check your Cloudinary upload preset configuration.');
        console.error('Error details:', errorData);
        throw new Error(
          `Failed to upload ${fileExtension.toUpperCase()} file. ` +
          `Your Cloudinary upload preset "${CLOUDINARY_UPLOAD_PRESET}" may not allow raw file uploads. ` +
          `Please enable "Resource Type: Raw" in your Cloudinary preset settings.`
        );
      }
      
      throw new Error(errorData.error?.message || 'Failed to upload file to Cloudinary');
    }

    const data: CloudinaryUploadResponse = await response.json();
    
    // For non-image files, ensure the URL includes the proper file extension
    let finalUrl = data.secure_url;
    if (!isImage && fileExtension && !finalUrl.endsWith(`.${fileExtension}`)) {
      finalUrl = `${finalUrl}.${fileExtension}`;
    }
    
    console.log('Cloudinary upload successful:', finalUrl);
    return finalUrl;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB (increased for documents)
  const allowedTypes = [
    // Images
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    // Documents
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain', // .txt
    'text/csv', // .csv
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: Images (JPG, PNG, GIF, WebP), PDF, Word, Excel, TXT, CSV`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit.`,
    };
  }

  return { valid: true };
}
