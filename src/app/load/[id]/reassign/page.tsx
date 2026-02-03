"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header, MobileLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Loader2, ArrowLeft, UserCheck } from "lucide-react";
import { useLoads } from "@/contexts/LoadContext";
import api from "@/lib/api";
import { toast } from "sonner";

interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export default function ReassignLoadPage() {
  const params = useParams();
  const router = useRouter();
  const { getLoadById, refreshLoads } = useLoads();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  const load = getLoadById(params.id as string);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true);
        const response = await api.getDrivers();
        if (response.success && response.drivers) {
          // Filter active drivers only
          const activeDrivers = response.drivers.filter((d: Driver) => d.isActive);
          setDrivers(activeDrivers);
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
        toast.error("Failed to load drivers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const handleReassign = async () => {
    if (!selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.request(`/loads/${params.id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ driverId: selectedDriverId }),
      });

      if (response.success) {
        toast.success("Load reassigned successfully!");
        await refreshLoads();
        router.push(`/load/${params.id}`);
      }
    } catch (error: any) {
      console.error("Failed to reassign load:", error);
      toast.error(error.message || "Failed to reassign load");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!load) {
    return (
      <MobileLayout showFAB={false}>
        <Header title="Reassign Load" showBack />
        <div className="px-4 py-8 text-center text-gray-500">Load not found</div>
      </MobileLayout>
    );
  }

  const content = (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
      {/* Load Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Load Details</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Load ID:</span> #{load.id.slice(-8).toUpperCase()}
            </p>
            <p>
              <span className="font-medium">From:</span> {load.pickupLocation}
            </p>
            <p>
              <span className="font-medium">To:</span> {load.dropoffLocation}
            </p>
            <p>
              <span className="font-medium">Client:</span> {load.clientName}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Driver Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Select New Driver</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No active drivers available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver) => (
                <div
                  key={driver._id}
                  onClick={() => setSelectedDriverId(driver._id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDriverId === driver._id
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{driver.name}</p>
                      <p className="text-sm text-gray-600">{driver.email}</p>
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                    </div>
                    {selectedDriverId === driver._id && (
                      <UserCheck className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex-1 h-12"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={handleReassign}
          disabled={!selectedDriverId || isSubmitting}
          className="flex-1 h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Reassigning...
            </>
          ) : (
            <>
              <UserCheck className="w-5 h-5 mr-2" />
              Reassign Load
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="block md:hidden">
        <MobileLayout showFAB={false}>
          <Header title="Reassign Load" showBack />
          {content}
        </MobileLayout>
      </div>
      <div className="hidden md:block min-h-screen bg-gray-50">
        <Header title="Reassign Load" showBack />
        {content}
      </div>
    </>
  );
}
