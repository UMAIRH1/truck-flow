"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { PODUpload } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useLoads } from "@/contexts/LoadContext";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslations } from "next-intl";

export default function UploadPODPage() {
  const params = useParams();
  const router = useRouter();
  const { getLoadById, refreshLoads } = useLoads();
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const t = useTranslations("uploadPOD");
  const tCommon = useTranslations("common");

  const load = getLoadById(params.id as string);

  if (!load) {
    return (
      <MobileLayout showFAB={false}>
        <Header title={t("title")} showBack />
        <div className="px-4 py-8 text-center text-gray-500">{t("loadNotFound")}</div>
      </MobileLayout>
    );
  }

  if (load.status !== "accepted") {
    return (
      <MobileLayout showFAB={false}>
        <Header title={t("title")} showBack />
        <div className="px-4 py-8 text-center text-gray-500">
          <p>{t("canOnlyUploadForAccepted")}</p>
          <Button onClick={() => router.back()} className="mt-4">
            {tCommon("goBack")}
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const handleUpload = async () => {
    if (images.length === 0) {
      toast.error(t("pleaseSelectImage"));
      return;
    }

    setIsUploading(true);

    try {
      // Images are already Cloudinary URLs from PODUpload component
      const imageUrl = images[0]; // Use first image
      
      // Send Cloudinary URL to API
      const response = await api.request(`/loads/${load.id}/pod`, {
        method: 'POST',
        body: JSON.stringify({ image: imageUrl }),
      });

      if (response.success) {
        toast.success(t("podUploadedSuccessfully"));
        await refreshLoads();
        router.push(`/load/${load.id}`);
      }
    } catch (error: any) {
      console.error("POD upload error:", error);
      toast.error(error.message || t("uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const content = (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      {/* Load Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-2">{t("loadDetails")}</h3>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            <span className="font-medium">{tCommon("loadNumber")}:</span> #{load.id.slice(-8).toUpperCase()}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">{tCommon("from")}:</span> {load.pickupLocation}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">{tCommon("to")}:</span> {load.dropoffLocation}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">{t("instructions")}</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>{t("takePhotosOfDelivery")}</li>
              <li>{t("ensureImagesAreClear")}</li>
              <li>{t("uploadWillMarkComplete")}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* POD Upload */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">{t("uploadProofOfDelivery")}</h3>
        <PODUpload images={images} onImagesChange={setImages} maxImages={5} />
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={isUploading || images.length === 0}
        className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t("uploading")}
          </>
        ) : (
          t("uploadAndComplete")
        )}
      </Button>

      {images.length === 0 && (
        <p className="text-center text-sm text-gray-500">{t("selectAtLeastOneImage")}</p>
      )}
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout showFAB={false}>
          <Header title={t("title")} showBack />
          {content}
        </MobileLayout>
      </div>
      <div className="hidden md:block min-h-screen bg-gray-50">
        <Header title={t("title")} showBack />
        {content}
      </div>
    </>
  );
}
