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
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  // Determine upload type based on file type
  const uploadType = file.type === 'application/pdf' ? 'raw' : 'image';
  
  console.log('Uploading to Cloudinary:', { 
    fileName: file.name, 
    fileType: file.type, 
    uploadType,
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
      
      // If PDF upload fails, try as image (some presets only allow images)
      if (uploadType === 'raw') {
        console.warn('PDF upload failed, this might be because the upload preset does not allow raw files');
        throw new Error('PDF upload not supported. Please configure your Cloudinary upload preset to allow raw files, or upload images only.');
      }
      
      throw new Error(errorData.error?.message || 'Failed to upload file to Cloudinary');
    }

    const data: CloudinaryUploadResponse = await response.json();
    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'application/pdf'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Please upload JPG, PNG, GIF, WebP, or PDF files.`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit.`,
    };
  }

  return { valid: true };
}
