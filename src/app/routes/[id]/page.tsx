"use client";

import React, { useEffect, useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useRoutes } from "@/contexts/RouteContext";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { 
  Truck, MapPin, Calendar, DollarSign, CheckCircle, XCircle, 
  Clock, Package, TrendingUp, Fuel, User, Trash2, Play, Navigation, Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

export default function RouteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations();
  const { user, isLoading: authLoading } = useAuth();
  const { routes, acceptRoute, rejectRoute, startRoute, completeRoute, deleteRoute, fetchRoutes, loading } = useRoutes();
  const [route, setRoute] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadActionLoading, setLoadActionLoading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const foundRoute = routes.find(r => r.id === params.id);
    setRoute(foundRoute);
  }, [routes, params.id]);

  const handleAccept = async () => {
    if (!route) return;
    setActionLoading(true);
    try {
      await acceptRoute(route.id);
    } catch (error) {
      console.error("Failed to accept route:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!route) return;
    setActionLoading(true);
    try {
      await rejectRoute(route.id);
    } catch (error) {
      console.error("Failed to reject route:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartRoute = async () => {
    if (!route) return;
    setActionLoading(true);
    try {
      await startRoute(route.id);
    } catch (error) {
      console.error("Failed to start route:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRoute = async () => {
    if (!route) return;
    setActionLoading(true);
    try {
      await completeRoute(route.id);
    } catch (error: any) {
      console.error("Failed to complete route:", error);
      alert(error.message || "Failed to complete route");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartLoad = async (loadId: string) => {
    if (!route) return;
    setLoadActionLoading(loadId);
    try {
      await api.startRouteLoad(route.id, loadId);
      await fetchRoutes();
    } catch (error: any) {
      console.error("Failed to start load:", error);
      alert(error.message || "Failed to start load");
    } finally {
      setLoadActionLoading(null);
    }
  };

  const handleCompleteLoad = async (loadId: string) => {
    if (!route) return;
    setLoadActionLoading(loadId);
    try {
      const response = await api.completeRouteLoad(route.id, loadId);
      await fetchRoutes();
      if (response.allLoadsCompleted) {
        alert("All loads completed! You can now complete the route.");
      }
    } catch (error: any) {
      console.error("Failed to complete load:", error);
      alert(error.message || "Failed to complete load");
    } finally {
      setLoadActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!route) return;
    
    if (!confirm("Are you sure you want to delete this route? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRoute(route.id);
      router.push("/routes");
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route");
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (canCompleteRoute) return "bg-green-500 text-white animate-pulse-slow shadow-[0_0_15px_rgba(34,197,94,0.4)]";
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getLoadStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: t("tabs.pending") };
      case "accepted": return { color: "bg-green-100 text-green-800 border-green-200", label: t("tabs.accepted") };
      case "in-progress": return { color: "bg-blue-100 text-blue-800 border-blue-200", label: t("tabs.inProgress") };
      case "completed": return { color: "bg-gray-100 text-gray-800 border-gray-200", label: t("tabs.completed") };
      default: return { color: "bg-gray-100 text-gray-800 border-gray-200", label: status };
    }
  };

  const getStatusLabel = (status: string) => {
    if (canCompleteRoute) return t("routes.readyToComplete");
    switch (status) {
      case "pending": return t("tabs.pending");
      case "accepted": return t("tabs.accepted");
      case "rejected": return t("tabs.rejected");
      case "in-progress": return t("tabs.inProgress");
      case "completed": return t("tabs.completed");
      default: return status;
    }
  };

  if (loading || authLoading || !route) {
    return (
      <MobileLayout showFAB={false}>
        <Header title={t("routes.routeDetails")} showBack />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t("common.loading")}</div>
        </div>
      </MobileLayout>
    );
  }

  const isDriver = user?.role === 'driver';
  const isManager = !!user && user.role !== 'driver';
  const canAcceptReject = isDriver && route.status === 'pending';
  const canStartRoute = isDriver && route.status === 'accepted';
  const isRouteInProgress = route.status === 'in-progress';
  const allLoadsCompleted = route.loads.length > 0 && route.loads.every((l: any) => l.status === 'completed');
  const canCompleteRoute = isDriver && isRouteInProgress && allLoadsCompleted;

  return (
    <MobileLayout showFAB={false}>
      <Header title={t("routes.routeDetails")} showBack />
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">{route.routeName}</h1>
                <p className="text-gray-500">{route.routeNumber}</p>
                {(route.origin || route.destination) && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {route.origin || t("routes.origin")} → {route.destination || t("routes.destination")}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>
                {getStatusLabel(route.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <div>
                  <div className="text-xs text-gray-500">{t("routes.driver")}</div>
                  <div className="font-medium">{route.assignedDriver.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="h-4 w-4" />
                <div>
                  <div className="text-xs text-gray-500">{t("routes.truck")}</div>
                  <div className="font-medium">{route.assignedTruck?.truckNumber || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <div>
                  <div className="text-xs text-gray-500">{t("routes.startDate")}</div>
                  <div className="font-medium">{new Date(route.startDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <div>
                  <div className="text-xs text-gray-500">{t("routes.distance")}</div>
                  <div className="font-medium">{route.totalDistance} {t("routes.km")}</div>
                </div>
              </div>
            </div>
            {route.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <span className="font-semibold block mb-1">{t("routes.notes")}:</span>
                {route.notes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver-only: Your Fee */}
        {isDriver && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">{t("routes.yourFee")}</h2>
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-sm text-gray-600">{t("routes.youWillEarn")}</div>
                <div className="text-3xl font-bold text-blue-600 mt-1">€{route.driverCost.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manager-only: Financial Summary */}
        {!isDriver && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">{t("routes.financialSummary")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">{t("routes.totalRevenue")}</div>
                  <div className="text-2xl font-bold text-blue-600">€{route.totalRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">{t("routes.totalCost")}</div>
                  <div className="text-2xl font-bold text-red-600">€{route.totalCost.toFixed(2)}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg col-span-2">
                  <div className="text-sm text-gray-600">{t("routes.netProfit")}</div>
                  <div className="text-3xl font-bold text-green-600">€{route.profit.toFixed(2)}</div>
                  <div className="text-sm text-gray-500 mt-1">€{route.profitPerKm.toFixed(2)}/{t("routes.km")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manager-only: Cost Breakdown */}
        {!isDriver && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">{t("routes.costBreakdown")}</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-gray-500" />
                    <span>{t("routes.fuelCost")}</span>
                  </div>
                  <span className="font-semibold">€{route.fuelCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{t("routes.driverCost")}</span>
                  </div>
                  <span className="font-semibold">€{route.driverCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span>{t("routes.truckCost")}</span>
                  </div>
                  <span className="font-semibold">€{route.truckCost.toFixed(2)}</span>
                </div>
                {route.tolls > 0 && (
                  <div className="flex justify-between items-center">
                    <span>{t("routes.tolls")}</span>
                    <span className="font-semibold">€{route.tolls.toFixed(2)}</span>
                  </div>
                )}
                {route.otherExpenses > 0 && (
                  <div className="flex justify-between items-center">
                    <span>{t("routes.otherExpenses")}</span>
                    <span className="font-semibold">€{route.otherExpenses.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loads - with driver actions when route is in-progress */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("routes.loadsCount", { count: route.loads.length })}
              {isDriver && isRouteInProgress && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {t("routes.completedLoadsCount", { completed: route.loads.filter((l: any) => l.status === 'completed').length, total: route.loads.length })}
                </span>
              )}
            </h2>
            {route.loads.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t("routes.noLoadsAttached")}</p>
            ) : (
              <div className="space-y-3">
                {route.loads.map((load: any) => {
                  const loadStatus = getLoadStatusConfig(load.status);
                  const loadId = load._id || load;
                  const isLoadLoading = loadActionLoading === loadId;

                  return (
                    <div
                      key={loadId}
                      className={`border rounded-lg p-4 transition-all ${
                        load.status === 'in-progress' ? 'border-blue-400 bg-blue-50 shadow-sm' :
                        load.status === 'completed' ? 'border-green-300 bg-green-50' :
                        'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{load.loadNumber || t("common.load")}</div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${loadStatus.color}`}>
                              {loadStatus.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {load.pickupLocation} → {load.dropoffLocation}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            {isDriver ? `€${load.driverPrice || 0}` : `€${load.clientPrice}`}
                          </div>
                          <div className="text-xs text-gray-500">{load.distance} {t("routes.km")}</div>
                        </div>
                      </div>

                      {/* Driver load actions when route is in-progress */}
                      {isDriver && isRouteInProgress && (
                        <div className="mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                          {/* Pending/Accepted load - can start */}
                          {(load.status === 'pending' || load.status === 'accepted') && (
                            <Button
                              onClick={() => handleStartLoad(loadId)}
                              disabled={isLoadLoading}
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isLoadLoading ? (
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4 mr-2" />
                              )}
                              {t("routes.startThisLoad")}
                            </Button>
                          )}

                          {/* In-progress load - can navigate or complete */}
                          {load.status === 'in-progress' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => router.push(`/map/${loadId}`)}
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Navigation className="h-4 w-4 mr-1" />
                                {t("routes.navigate")}
                              </Button>
                              <Button
                                onClick={() => handleCompleteLoad(loadId)}
                                disabled={isLoadLoading}
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                {isLoadLoading ? (
                                  <Clock className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                {t("routes.complete")}
                              </Button>
                            </div>
                          )}

                          {/* Completed load */}
                          {load.status === 'completed' && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              <span>{t("routes.completed")}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* === DRIVER ACTION BUTTONS === */}

        {/* Pending: Accept/Reject */}
        {canAcceptReject && (
          <div className="flex gap-4">
            <Button
              onClick={handleReject}
              disabled={actionLoading}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t("routes.reject")}
            </Button>
            <Button
              onClick={handleAccept}
              disabled={actionLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t("routes.accept")}
            </Button>
          </div>
        )}

        {/* Accepted: Start Route */}
        {canStartRoute && (
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2 text-black">{t("routes.readyToStart")}</h3>
              <p className="text-sm text-gray-600">
                {t("routes.readyToStartDesc")}
              </p>
            </div>
            <Button
              onClick={handleStartRoute}
              disabled={actionLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full flex items-center justify-center gap-2"
            >
              <Truck className="w-5 h-5" />
              {actionLoading ? t("routes.starting") : t("routes.startRoute")}
            </Button>
          </div>
        )}

        {/* In-Progress: Ready to Complete Route (when all loads done) */}
        {canCompleteRoute && (
          <div className="bg-green-100 rounded-xl p-6 shadow-lg border-2 border-green-500 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-3 rounded-full shadow-md">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-xl text-green-900 leading-tight">
                  {t("routes.readyToComplete")}
                </h3>
                <p className="text-sm text-green-800 mt-1 font-medium">
                  {t("routes.allLoadsCompletedDesc")}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleCompleteRoute}
                disabled={actionLoading}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
              >
                {actionLoading ? (
                  <Clock className="h-6 w-6 animate-spin" />
                ) : (
                  <CheckCircle className="h-6 w-6" />
                )}
                {actionLoading ? t("routes.completing") : t("routes.completeRoute")}
              </Button>
            </div>
          </div>
        )}

        {/* In-Progress: Navigation hint when loads still pending */}
        {isDriver && isRouteInProgress && !allLoadsCompleted && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg border-2 border-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-3 rounded-full">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{t("routes.routeInProgress")}</h3>
                <p className="text-sm text-blue-100">
                  {t("routes.routeInProgressDesc")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed: Success message */}
        {isDriver && route.status === 'completed' && (
          <div className="bg-green-50 rounded-xl p-6 shadow-md border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="font-bold text-lg text-green-900">{t("routes.routeCompleted")}</h3>
            </div>
            <p className="text-sm text-green-700 mt-2">
              {t("routes.routeCompletedDesc")}
            </p>
          </div>
        )}

        {/* === MANAGER ACTION BUTTONS === */}
        {isManager && route.status === 'pending' && (
          <div className="flex gap-4">
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? t("routes.deleting") : t("routes.deleteRoute")}
            </Button>
            <Button
              onClick={() => router.push(`/routes/${route.id}/edit`)}
              className="flex-1 bg-black hover:bg-gray-800"
            >
              {t("routes.editRoute")}
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
