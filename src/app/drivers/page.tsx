"use client";

import { useState, useEffect } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, MoreVertical, UserCheck, UserX, Trash2, Plus, ChartLine } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDrivers();
      if (response.success && response.drivers) {
        setDrivers(response.drivers);
      }
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
      toast.error("Failed to load drivers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      const response = await api.request(`/users/${driverId}/status`, {
        method: "PATCH",
      });

      if (response.success) {
        toast.success(currentStatus ? "Driver deactivated" : "Driver activated");
        fetchDrivers();
      }
    } catch (error) {
      toast.error("Failed to update driver status");
    }
  };

  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    if (!confirm(`Are you sure you want to delete ${driverName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.request(`/users/${driverId}`, {
        method: "DELETE",
      });

      if (response.success) {
        toast.success("Driver deleted successfully");
        fetchDrivers();
      }
    } catch (error) {
      toast.error("Failed to delete driver");
    }
  };

  if (isLoading) {
    return (
      <MobileLayout showFAB={false} showBottomNav={true}>
        <Header title="Drivers" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading drivers...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showFAB={false} showBottomNav={true}>
      <Header title="Drivers" showBack />
      
      <div className="max-w-7xl px-4 py-6 mx-auto lg:px-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Drivers</h1>
            <p className="text-gray-600 text-sm mt-1">{drivers.length} total drivers</p>
          </div>
          <Button
            onClick={() => router.push("/add-driver")}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>

        {/* Drivers List */}
        {drivers.length === 0 ? (
          <Card className="p-8 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Drivers Yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first driver</p>
            <Button
              onClick={() => router.push("/add-driver")}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {drivers.map((driver) => (
              <Card key={driver._id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    {/* Driver Info */}
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 break-words leading-tight">
                            {driver.name}
                          </h3>
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded-full w-fit ${
                              driver.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {driver.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 min-w-0">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{driver.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span className="break-all">{driver.phone}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          Added {new Date(driver.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => router.push(`/drivers/${driver._id}`)}
                          className="cursor-pointer"
                        >
                          <ChartLine className="w-4 h-4 mr-2" />
                          View Performance
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(driver._id, driver.isActive)}
                          className="cursor-pointer"
                        >
                          {driver.isActive ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDriver(driver._id, driver.name)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
