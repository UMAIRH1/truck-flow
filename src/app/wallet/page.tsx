"use client";

import { Header, MobileLayout } from "@/components/layout";
import { LineChart } from "@/components/shared";
import { CreditCard, MoveRight, Upload, FileText, Trash, CloudUpload } from "lucide-react";
import AccountDetails from "./_components/AccountDetails";
import Modal from "@/app/settings/_components/modal";
import { aggregateMonthlyMetrics, computeTrend } from "@/lib/earnings";
import { useState, useRef } from "react";
import { useLoads } from "@/contexts/LoadContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import api from "@/lib/api";

export default function WalletPage() {
  const t = useTranslations("wallet");
  const actionLinks = [
    { action: "modal", icon: CreditCard, label: t("paymentMethods") },
    { action: "invoice", icon: Upload, label: t("uploadInvoice") },
    { action: "documents", icon: CloudUpload, label: t("uploadDocuments") },
  ];
  const { loads } = useLoads();
  const completedLoads = loads.filter((l) => l.status === "completed");
  const chartPoints = aggregateMonthlyMetrics(completedLoads, "income", 3);
  const trend = computeTrend(chartPoints);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const invoiceInputRef = useRef<HTMLInputElement | null>(null);
  const docsInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: number; name: string; size: number; kind: "invoice" | "documents"; uploadedAt: string }>>([]);

  const handleFiles = async (files: FileList | null, type: "invoice" | "documents") => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf") {
      toast("Only PDF files are supported");
      return;
    }
    try {
      const response = await api.uploadFile(file, type);
      if (response.success) {
        toast.success(`${file.name} uploaded successfully`);
        setUploadedFiles((prev) => [
          { 
            id: Date.now(), 
            name: response.file.originalName, 
            size: response.file.size, 
            kind: type, 
            uploadedAt: response.file.uploadedAt 
          }, 
          ...prev
        ]);
      }
    } catch (err) {
      toast.error(`Failed to upload ${file.name}`);
      console.error('Upload error:', err);
    } finally {
      if (type === "invoice" && invoiceInputRef.current) invoiceInputRef.current.value = "";
      if (type === "documents" && docsInputRef.current) docsInputRef.current.value = "";
    }
  };

  const content = (
    <div className="px-4 md:px-6 py-4 md:py-8 max-w-md md:max-w-7xl mx-auto">
      <div className="mb-4">
        <LineChart data={chartPoints} trend={trend} trendLabel={t("last3Months")} className="h-64 md:h-80 lg:h-96" />
      </div>

      <div>
        <AccountDetails />
      </div>
      <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
        {actionLinks.map((link, index) => {
          if (link.action === "modal") {
            return (
              <button key={index} type="button" className="block w-full text-left" onClick={() => setIsModalOpen(true)}>
                <div className="flex items-center justify-between p-4 md:p-6 text-(--color-light-black-border) bg-(--color-yellow-light) rounded-xl shadow-sm transition-colors">
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 md:h-6 w-5 md:w-6 " />
                    <span className="font-medium">{link.label}</span>
                  </div>
                  <MoveRight className="h-5 md:h-6 w-5 md:w-6 " />
                </div>
              </button>
            );
          }
          if (link.action === "invoice") {
            return (
              <button key={index} type="button" className="block w-full text-left" onClick={() => invoiceInputRef.current && invoiceInputRef.current.click()}>
                <div className="flex items-center justify-between p-4 md:p-6 text-(--color-light-black-border)  bg-(--color-yellow-light) rounded-xl shadow-sm transition-colors">
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 md:h-6 w-5 md:w-6 " />
                    <span className="font-medium">{link.label}</span>
                  </div>
                  <MoveRight className="h-5 md:h-6 w-5 md:w-6" />
                </div>
              </button>
            );
          }
          if (link.action === "documents") {
            return (
              <button key={index} type="button" className="block w-full text-left" onClick={() => docsInputRef.current && docsInputRef.current.click()}>
                <div className="flex items-center justify-between text-(--color-light-black-border)  bg-(--color-yellow-light)  p-4 md:p-6rounded-xl shadow-sm transition-colors">
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 md:h-6 w-5 md:w-6 " />
                    <span className="font-medium">{link.label}</span>
                  </div>
                  <MoveRight className="h-5 md:h-6 w-5 md:w-6 " />
                </div>
              </button>
            );
          }
          return (
            <div key={index} className="block">
              <div className="flex items-center justify-between p-4 md:p-6 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <link.icon className="h-5 md:h-6 w-5 md:w-6 text-gray-600" />
                  <span className="font-medium">{link.label}</span>
                </div>
                <MoveRight className="h-5 md:h-6 w-5 md:w-6 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>
      <input ref={invoiceInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFiles(e.target.files, "invoice")} />
      <input ref={docsInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFiles(e.target.files, "documents")} />
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadedFiles.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-gray-600" />
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-gray-500">
                    {(f.size / 1024).toFixed(1)} KB • {f.kind}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">{new Date(f.uploadedAt).toLocaleString()}</div>
                <button onClick={() => setUploadedFiles((prev) => prev.filter((p) => p.id !== f.id))} className="text-gray-400 hover:text-red-600">
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t("paymentMethods")} />
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout>
          <Header title={t("myWallet")} showBack />
          {content}
        </MobileLayout>
      </div>
      <div className="hidden md:block min-h-screen bg-gray-50">
        <MobileLayout>
          <Header title={t("myWallet")} showBack />
          {content}
        </MobileLayout>
      </div>
    </>
  );
}
