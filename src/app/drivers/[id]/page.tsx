"use client";

import { useState, useEffect } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { StatCard, LoadCard } from "@/components/shared";
import { useParams, useRouter } from "next/navigation";
import { DollarSign, Truck, CheckCircle, XCircle, Clock, ArrowLeft, ChartBar, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DriverStats {
  totalLoads: number;
  completedLoads: number;
  rejectedLoads: number;
  acceptedLoads: number;
  inProgressLoads: number;
  pendingLoads: number;
  totalEarnings: number;
  totalProfitGenerated: number;
  recentLoads: any[];
}

export default function DriverPerformancePage() {
  const { id } = useParams();
  const router = useRouter();
  const [driver, setDriver] = useState<any>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDriverData();
    }
  }, [id]);

  const fetchDriverData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDriverStats(id as string);
      if (response.success) {
        setDriver(response.driver);
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Failed to fetch driver stats:", error);
      toast.error("Failed to load performance data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!driver || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Driver Not Found</h2>
        <button 
          onClick={() => router.push("/drivers")}
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Drivers
        </button>
      </div>
    );
  }

  const completionRate = stats.totalLoads > 0 
    ? Math.round((stats.completedLoads / stats.totalLoads) * 100) 
    : 0;

  return (
    <MobileLayout showFAB={false} showBottomNav={true}>
      <Header 
        title={`${driver.name}'s Performance`} 
        showBack={true} 
      />

      <div className="max-w-7xl px-4 py-6 mx-auto lg:px-6 space-y-6">
        {/* Driver Profile Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
            {driver.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Joined {new Date(driver.createdAt).toLocaleDateString()}</span>
              <Badge variant={driver.isActive ? "default" : "secondary"}>
                {driver.isActive ? "Active Account" : "Inactive Account"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={DollarSign} 
            label="Total Earnings" 
            value={`€ ${stats.totalEarnings.toLocaleString()}`} 
            className="text-green-600"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Profit Generated" 
            value={`€ ${stats.totalProfitGenerated.toLocaleString()}`}
            className="text-blue-600"
          />
          <StatCard 
            icon={Truck} 
            label="Total Loads" 
            value={stats.totalLoads} 
          />
          <StatCard 
            icon={CheckCircle} 
            label="Completion Rate" 
            value={`${completionRate}%`}
            className={completionRate > 80 ? "text-green-600" : "text-yellow-600"}
          />
        </div>

        {/* Load Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ChartBar className="w-4 h-4" /> Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Completed</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">{stats.completedLoads}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">In Progress</span>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">{stats.inProgressLoads}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Accepted</span>
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">{stats.acceptedLoads}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">Pending</span>
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0">{stats.pendingLoads}</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Rejected</span>
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">{stats.rejectedLoads}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Loads History */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold flex items-center gap-2 px-2">
              <Clock className="w-4 h-4" /> Recent Performance History
            </h3>
            <div className="space-y-3">
              {stats.recentLoads.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 italic">
                  No load history found for this driver.
                </div>
              ) : (
                stats.recentLoads.map((load: any) => (
                  <LoadCard key={load._id} load={load} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
