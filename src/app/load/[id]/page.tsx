"use client";

import { useParams, useRouter } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { useLoads } from "@/contexts/LoadContext";
import { useAuth } from "@/contexts/AuthContext";
import { Truck, Clock, Check, BusFront, ArrowDownLeft, ArrowUpRight, X, DollarSign, Package, Calendar, Fuel, AlertCircle, User, Phone, Mail, MapPin, Upload, FileText } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ASSETS } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared";
import { DocumentViewer } from "@/components/shared/DocumentViewer";
import api from "@/lib/api";
import { useState } from "react";

export default function LoadStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { getLoadById, refreshLoads } = useLoads();
  const { user } = useAuth();
  const t = useTranslations("loadStatus");
  const tCommon = useTranslations("common");

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerFilename, setViewerFilename] = useState("");

  const load = getLoadById(params.id as string);
  const isManager = user?.role === "manager";
  const isDriver = user?.role === "driver";

  const openDocument = (url: string, filename: string) => {
    setViewerUrl(url);
    setViewerFilename(filename);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerUrl("");
    setViewerFilename("");
  };

  // Debug info
  console.log("Load Detail Debug:", {
    loadId: params.id,
    loadStatus: load?.status,
    userRole: user?.role,
    isDriver,
    isManager,
    hasPodImages: load?.podImages?.length || 0,
    hasInvoices: load?.invoices?.length || 0,
    hasDocuments: load?.documents?.length || 0,
    invoices: load?.invoices,
    documents: load?.documents,
  });

  if (!load) {
    return (
      <>
        <div className="block md:hidden">
          <MobileLayout showFAB={false}>
            <Header title={t("title")} showBack />
            <div className="px-4 py-8 text-center text-gray-500">{t("loadNotFound")}</div>
          </MobileLayout>
        </div>
        <div className="hidden md:block">
          <Header title={t("title")} showBack />
          <div className="px-4 py-8 text-center text-gray-500">{t("loadNotFound")}</div>
        </div>
      </>
    );
  }

  const timeline = load.timeline || [];

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  const profit = load.clientPrice - (load.driverPrice || 0);

  const content = (
    <div className="px-4 py-4 space-y-6 max-w-4xl mx-auto">
      {/* Load Header Card */}
      <div className="bg-(--color-primary-yellow-dark) rounded-2xl p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-center">
          <OptimizedImage src={ASSETS.images.icons.truck} alt="Load Status" width={200} height={100} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-(--color-blue-border) p-2 rounded-md">
              <BusFront className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-(--color-stat-gray) text-lg block">{load.clientName}</span>
              <span className="text-xs text-(--color-dark-gray)">Load #{load.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          <StatusBadge status={load.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <ArrowDownLeft className="h-4 w-4 text-(--color-primary-gray)" />
              <div>
                <p className="text-xs text-(--color-dark-gray)">{tCommon("from")}</p>
                <p className="font-medium text-(--color-stat-gray)">{load.pickupLocation}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-(--color-primary-gray)" />
              <div>
                <p className="text-xs text-(--color-dark-gray)">{tCommon("to")}</p>
                <p className="font-medium text-(--color-stat-gray)">{load.dropoffLocation}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
          <div className="flex items-center gap-4 text-xs text-(--color-dark-gray)">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(load.loadingDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{load.loadingTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>{load.loadWeight} KG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manager-specific Financial Details */}
      {isManager && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-black">Financial Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">Client Price</span>
              </div>
              <p className="text-xl font-bold text-green-600">€{load.clientPrice.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-600">Driver Price</span>
              </div>
              <p className="text-xl font-bold text-blue-600">€{(load.driverPrice || 0).toFixed(2)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-gray-600">Total Expenses</span>
              </div>
              <p className="text-xl font-bold text-orange-600">€{((load.fuel || 0) + (load.tolls || 0) + (load.otherExpenses || 0)).toFixed(2)}</p>
            </div>
            <div className={`${profit >= 0 ? 'bg-purple-50' : 'bg-red-50'} p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`h-4 w-4 ${profit >= 0 ? 'text-purple-600' : 'text-red-600'}`} />
                <span className="text-xs text-gray-600">Profit</span>
              </div>
              <p className={`text-xl font-bold ${profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>€{profit.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-sm mb-3 text-gray-700">Expense Breakdown</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Fuel</p>
                  <p className="font-semibold text-sm">€{(load.fuel || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Tolls</p>
                  <p className="font-semibold text-sm">€{(load.tolls || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Other</p>
                  <p className="font-semibold text-sm">€{(load.otherExpenses || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver-specific Payment Details */}
      {isDriver && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-black">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-600">Your Payment</span>
              </div>
              <p className="text-2xl font-bold text-green-600">€{(load.driverPrice || 0).toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-600">Payment Terms</span>
              </div>
              <p className="text-lg font-bold text-blue-600">{load.paymentTerms} Days</p>
              <p className="text-xs text-gray-500 mt-1">Expected: {formatDate(load.expectedPayoutDate)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Load Details */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="font-bold text-lg mb-4 text-black">Load Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Shipping Type</p>
              <p className="font-semibold">{load.shippingType}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Load Weight</p>
              <p className="font-semibold">{load.loadWeight} KG</p>
            </div>
          </div>
          {load.pallets && (
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Pallets</p>
                <p className="font-semibold">{load.pallets}</p>
              </div>
            </div>
          )}
          {isManager && (
            <>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Payment Terms</p>
                  <p className="font-semibold">{load.paymentTerms} Days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Expected Payout</p>
                  <p className="font-semibold">{formatDate(load.expectedPayoutDate)}</p>
                </div>
              </div>
            </>
          )}
        </div>
        {load.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{load.notes}</p>
          </div>
        )}
      </div>

      {/* Driver Information */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="font-bold text-lg mb-4 text-black">
          {t("driver")} Information
        </h3>
        {load.assignedDriver ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-base">{load.assignedDriver.name}</p>
                <p className="text-xs text-gray-500">Assigned Driver</p>
              </div>
            </div>
            {load.assignedDriver.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{load.assignedDriver.phone}</span>
              </div>
            )}
            {load.assignedDriver.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{load.assignedDriver.email}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>{t("unassigned")}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-black">Timeline</h3>
          <div className="space-y-4">
            {timeline.map((item, index) => {
              const { date, time } = formatDateTime(item.date);
              const isCompleted = item.completed;

              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500" : "bg-(--color-primary-yellow-dark)"}`}>
                      {isCompleted ? <Check className="h-5 w-5 text-white" /> : <X className="h-5 w-5 text-white" />}
                    </div>
                    {index < timeline.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base text-black">{item.status}</p>
                    <p className="text-sm text-(--color-button-table)">
                      {date} | {time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* POD Images */}
      {load.podImages && load.podImages.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-black">Proof of Delivery</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {load.podImages.map((image, index) => (
              <button
                key={index}
                onClick={() => openDocument(image, `pod-${index + 1}.jpg`)}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-yellow-400 transition-colors group cursor-pointer"
              >
                <img src={image} alt={`POD ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">View</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      {load.invoices && load.invoices.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-black">Invoices</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {load.invoices.map((file, index) => {
              // Check if it's an image or document
              const isImage = file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                (!file.includes('/raw/upload/') && file.includes('/image/upload/'));

              // Get file extension for non-images
              const extension = file.split('.').pop()?.toUpperCase() || 'FILE';

              // For Cloudinary raw files, ensure proper extension in URL
              let downloadUrl = file;
              if (file.includes('/raw/upload/') && !file.match(/\.\w+$/)) {
                // Try to add common extensions
                const possibleExt = file.includes('pdf') ? 'pdf' : 'pdf';
                downloadUrl = `${file}.${possibleExt}`;
              }

              return (
                <button
                  key={index}
                  onClick={() => openDocument(downloadUrl, `invoice-${index + 1}.${extension.toLowerCase()}`)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-yellow-400 transition-colors group cursor-pointer"
                >
                  {isImage ? (
                    <>
                      <img src={file} alt={`Invoice ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">View</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50 group-hover:bg-yellow-50">
                      <FileText className="h-16 w-16 text-gray-400 group-hover:text-yellow-600 mb-2" />
                      <p className="text-xs text-gray-600 text-center font-semibold">{extension}</p>
                      <p className="text-xs text-gray-600 text-center mt-1">Invoice {index + 1}</p>
                      <p className="text-xs text-blue-600 mt-2">Click to view</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Documents */}
      {load.documents && load.documents.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-black">Other Documents</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {load.documents.map((file, index) => {
              // Check if it's an image or document
              const isImage = file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                (!file.includes('/raw/upload/') && file.includes('/image/upload/'));

              // Get file extension for non-images
              const extension = file.split('.').pop()?.toUpperCase() || 'FILE';

              // For Cloudinary raw files, ensure proper extension in URL
              let downloadUrl = file;
              if (file.includes('/raw/upload/') && !file.match(/\.\w+$/)) {
                // Try to add common extensions
                const possibleExt = file.includes('pdf') ? 'pdf' : 'pdf';
                downloadUrl = `${file}.${possibleExt}`;
              }

              return (
                <button
                  key={index}
                  onClick={() => openDocument(downloadUrl, `document-${index + 1}.${extension.toLowerCase()}`)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-yellow-400 transition-colors group cursor-pointer"
                >
                  {isImage ? (
                    <>
                      <img src={file} alt={`Document ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">View</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50 group-hover:bg-yellow-50">
                      <FileText className="h-16 w-16 text-gray-400 group-hover:text-yellow-600 mb-2" />
                      <p className="text-xs text-gray-600 text-center font-semibold">{extension}</p>
                      <p className="text-xs text-gray-600 text-center mt-1">Document {index + 1}</p>
                      <p className="text-xs text-blue-600 mt-2">Click to view</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Start Journey Button for Driver */}
      {isDriver && load.status === "accepted" && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2 text-black">Ready to Start?</h3>
            <p className="text-sm text-gray-600">
              Click the button below when you are ready to start the journey for this load.
            </p>
          </div>
          <Button
            onClick={async () => {
              try {
                await api.startLoad(load.id);
                await refreshLoads();
              } catch (error) {
                console.error("Failed to start load:", error);
              }
            }}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full flex items-center justify-center gap-2"
          >
            <Truck className="w-5 h-5" />
            Start Journey
          </Button>
        </div>
      )}

      {/* Upload POD Button for Driver - Only in Progress */}
      {isDriver && load.status === "in-progress" && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2 text-black">Complete Delivery</h3>
            <p className="text-sm text-gray-600">
              Upload proof of delivery to mark this load as completed.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => router.push(`/load/${load.id}/upload-pod`)}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Proof of Delivery
            </Button>
            <Button
              onClick={() => router.push(`/load/${load.id}/upload-documents`)}
              variant="outline"
              className="w-full h-12"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Invoice & Documents
            </Button>
          </div>
        </div>
      )}

      {/* Show completed status for driver */}
      {isDriver && load.status === "completed" && (
        <div className="bg-green-50 rounded-xl p-6 shadow-md border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Check className="h-6 w-6 text-green-600" />
            <h3 className="font-bold text-lg text-green-900">Load Completed</h3>
          </div>
          <p className="text-sm text-green-700">
            This load has been marked as completed.
          </p>
        </div>
      )}

      {/* Accept/Reject Buttons for Driver - Pending Loads */}
      {isDriver && load.status === "pending" && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-black">Load Assignment</h3>
          <p className="text-sm text-gray-600 mb-4">
            This load has been assigned to you. Please accept or decline.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={async () => {
                try {
                  await api.declineLoad(load.id);
                  await refreshLoads();
                  router.push("/");
                } catch (error) {
                  console.error("Failed to decline load:", error);
                }
              }}
              variant="outline"
              className="flex-1 h-12 border-red-500 text-red-500 hover:bg-red-50"
            >
              Decline
            </Button>
            <Button
              onClick={async () => {
                try {
                  await api.acceptLoad(load.id);
                  await refreshLoads();
                } catch (error) {
                  console.error("Failed to accept load:", error);
                }
              }}
              className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white"
            >
              Accept Load
            </Button>
          </div>
        </div>
      )}

      {/* Reassign Button for Manager - Rejected Loads */}
      {isManager && load.status === "rejected" && (
        <div className="bg-red-50 rounded-xl p-6 shadow-md border border-red-200">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-red-900 mb-2">Load Rejected</h3>
            <p className="text-sm text-red-700">
              This load was rejected by the driver. You can reassign it to another driver.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/load/${load.id}/reassign`)}
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full"
          >
            <User className="w-5 h-5 mr-2" />
            Reassign to Another Driver
          </Button>
        </div>
      )}

      {/* Edit Load Button for Manager */}
      {isManager && load.status !== "completed" && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <Button
            onClick={() => router.push(`/load/${load.id}/edit`)}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full"
          >
            Edit Load Details
          </Button>
        </div>
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

      {/* Document Viewer Modal */}
      {viewerOpen && (
        <DocumentViewer
          url={viewerUrl}
          filename={viewerFilename}
          onClose={closeViewer}
        />
      )}
    </>
  );
}
