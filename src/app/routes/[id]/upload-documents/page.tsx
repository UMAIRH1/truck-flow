"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, Loader2, CheckCircle, File } from "lucide-react";
import { useRoutes } from "@/contexts/RouteContext";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function RouteUploadDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const { routes, uploadDocuments } = useRoutes();
  const [invoiceFiles, setInvoiceFiles] = useState<string[]>([]);
  const [documentFiles, setDocumentFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations();

  const route = routes.find(r => r.id === params.id);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "invoice" | "documents"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(validation.error);
          return null;
        }

        try {
          const url = await uploadToCloudinary(file);
          return url;
        } catch (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      if (validUrls.length > 0) {
        if (type === "invoice") {
          setInvoiceFiles(prev => [...prev, ...validUrls]);
        } else {
          setDocumentFiles(prev => [...prev, ...validUrls]);
        }
        toast.success(`${validUrls.length} file(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
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
    if (invoiceFiles.length === 0 && documentFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    if (!route) return;

    setIsSubmitting(true);

    try {
      await uploadDocuments(route.id, {
        invoices: invoiceFiles,
        documents: documentFiles,
      });

      toast.success("Documents uploaded successfully! Route completed.");
      router.push(`/routes/${route.id}`);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to upload documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!route) {
    return (
      <MobileLayout showFAB={false}>
        <Header title="Upload Route Documents" showBack />
        <div className="px-4 py-8 text-center text-gray-500">Loading...</div>
      </MobileLayout>
    );
  }

  const content = (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      {/* Route Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-2">Route Details</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Name:</span> {route.routeName}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Origin:</span> {route.origin}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Destination:</span> {route.destination}
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
              <li>Upload invoices for this route</li>
              <li>Upload any additional documents (receipts, bills, etc.)</li>
              <li>Maximum file size: 10MB per file</li>
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
              <h3 className="font-semibold text-lg">Invoices</h3>
            </div>
            <span className="text-sm text-gray-500">{invoiceFiles.length} file(s)</span>
          </div>

          {invoiceFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {invoiceFiles.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={file} alt={`Invoice ${index + 1}`} className="w-full h-full object-cover" />
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

          <label className="block">
            <input
              type="file"
              accept="image/*,application/pdf"
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
                {isUploading ? "Uploading..." : "Click to upload invoices"}
              </p>
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

          {documentFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {documentFiles.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={file} alt={`Document ${index + 1}`} className="w-full h-full object-cover" />
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

          <label className="block">
            <input
              type="file"
              accept="image/*,application/pdf"
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
            </div>
          </label>
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || isUploading || (invoiceFiles.length === 0 && documentFiles.length === 0)}
        className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5 mr-2" />
            Submit Documents
          </>
        )}
      </Button>
    </div>
  );

  return (
    <MobileLayout showFAB={false}>
      <Header title="Upload Route Documents" showBack />
      {content}
    </MobileLayout>
  );
}
