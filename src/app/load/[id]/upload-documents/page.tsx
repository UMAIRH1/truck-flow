"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, Loader2, CheckCircle, File } from "lucide-react";
import { useLoads } from "@/contexts/LoadContext";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { toast } from "sonner";
import api from "@/lib/api";

export default function UploadDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const { getLoadById, refreshLoads } = useLoads();
  const [invoiceFiles, setInvoiceFiles] = useState<string[]>([]);
  const [documentFiles, setDocumentFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = getLoadById(params.id as string);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "invoice" | "documents"
  ) => {
    const files = e.target.files;
    console.log('File input triggered:', { type, filesCount: files?.length });
    
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        console.log('Processing file:', { name: file.name, size: file.size, type: file.type });
        
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          console.error('Validation failed:', validation.error);
          toast.error(validation.error);
          return null;
        }

        console.log('File validated, uploading to Cloudinary...');
        
        // Upload to Cloudinary
        try {
          const url = await uploadToCloudinary(file);
          console.log('Upload successful:', url);
          return url;
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      console.log('Upload complete:', { total: files.length, successful: validUrls.length, type });

      if (validUrls.length > 0) {
        if (type === "invoice") {
          setInvoiceFiles(prev => {
            const newFiles = [...prev, ...validUrls];
            console.log('Updated invoice files:', newFiles);
            return newFiles;
          });
        } else {
          setDocumentFiles(prev => {
            const newFiles = [...prev, ...validUrls];
            console.log('Updated document files:', newFiles);
            return newFiles;
          });
        }
        toast.success(`${validUrls.length} file(s) uploaded successfully`);
      } else {
        toast.error('No files were uploaded successfully');
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the input value to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const removeFile = (index: number, type: "invoice" | "documents") => {
    if (type === "invoice") {
      setInvoiceFiles(invoiceFiles.filter((_, i) => i !== index));
    } else {
      setDocumentFiles(documentFiles.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    console.log('=== SUBMIT DOCUMENTS ===');
    console.log('Submit clicked:', { 
      invoiceCount: invoiceFiles.length, 
      documentCount: documentFiles.length,
      invoiceFiles,
      documentFiles,
      loadId: params.id
    });

    if (invoiceFiles.length === 0 && documentFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        invoices: invoiceFiles,
        documents: documentFiles,
      };
      
      console.log('Request URL:', `/loads/${params.id}/documents`);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await api.request(`/loads/${params.id}/documents`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      console.log('Backend response:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('✅ Documents uploaded successfully!');
        console.log('Load status:', response.load?.status);
        console.log('Load completedAt:', response.load?.completedAt);
        
        toast.success("Documents uploaded successfully! Load marked as completed.");
        
        // Refresh loads to get updated data
        await refreshLoads();
        
        // Navigate to dashboard
        console.log('Navigating to dashboard...');
        router.push('/');
      } else {
        console.error('❌ Backend returned error:', response);
        toast.error(response.message || "Failed to upload documents");
      }
    } catch (error: any) {
      console.error("❌ Submit error details:", {
        message: error.message,
        response: error.response,
        stack: error.stack,
        error
      });
      toast.error(error.message || "Failed to upload documents. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!load) {
    return (
      <MobileLayout showFAB={false}>
        <Header title="Upload Documents" showBack />
        <div className="px-4 py-8 text-center text-gray-500">Load not found</div>
      </MobileLayout>
    );
  }

  const content = (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      {/* Load Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2">Load Details</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Load #:</span> {load.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">From:</span> {load.pickupLocation}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">To:</span> {load.dropoffLocation}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Upload Instructions</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Upload invoice for this load</li>
              <li>Upload any additional documents (receipts, bills, etc.)</li>
              <li>Supported formats: JPG, PNG, PDF</li>
              <li>Max file size: 5MB per file</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invoice Upload */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-lg">Invoice</h3>
            </div>
            <span className="text-sm text-gray-500">{invoiceFiles.length} file(s)</span>
          </div>

          {/* Invoice Preview */}
          {invoiceFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {invoiceFiles.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {file.endsWith('.pdf') || file.includes('/raw/upload/') ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <FileText className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600 text-center">PDF Document</p>
                    </div>
                  ) : (
                    <img src={file} alt={`Invoice ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(index, "invoice")}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className="block">
            <input
              type="file"
              accept="image/*,application/pdf,.pdf"
              multiple
              onChange={(e) => handleFileUpload(e, "invoice")}
              className="hidden"
              disabled={isUploading}
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-400 transition-colors">
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-yellow-400 mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {isUploading ? "Uploading..." : "Click to upload invoice"}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, or PDF (max 5MB)</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Other Documents Upload */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <File className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-lg">Other Documents</h3>
            </div>
            <span className="text-sm text-gray-500">{documentFiles.length} file(s)</span>
          </div>

          {/* Documents Preview */}
          {documentFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {documentFiles.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {file.endsWith('.pdf') || file.includes('/raw/upload/') ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <FileText className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600 text-center">PDF Document</p>
                    </div>
                  ) : (
                    <img src={file} alt={`Document ${index + 1}`} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(index, "documents")}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className="block">
            <input
              type="file"
              accept="image/*,application/pdf,.pdf"
              multiple
              onChange={(e) => handleFileUpload(e, "documents")}
              className="hidden"
              disabled={isUploading}
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-400 transition-colors">
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-yellow-400 mx-auto mb-2 animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {isUploading ? "Uploading..." : "Click to upload documents"}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, or PDF (max 5MB)</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={(e) => {
          console.log('Button clicked!', { 
            isSubmitting, 
            isUploading, 
            invoiceCount: invoiceFiles.length,
            documentCount: documentFiles.length,
            disabled: isSubmitting || isUploading || (invoiceFiles.length === 0 && documentFiles.length === 0)
          });
          handleSubmit();
        }}
        disabled={isSubmitting || isUploading || (invoiceFiles.length === 0 && documentFiles.length === 0)}
        className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Uploading Documents...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Submit Documents
          </>
        )}
      </Button>

      {(invoiceFiles.length === 0 && documentFiles.length === 0) && (
        <p className="text-center text-sm text-gray-500">Please upload at least one file</p>
      )}
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout showFAB={false}>
          <Header title="Upload Documents" showBack />
          {content}
        </MobileLayout>
      </div>
      <div className="hidden md:block min-h-screen bg-gray-50">
        <Header title="Upload Documents" showBack />
        {content}
      </div>
    </>
  );
}
