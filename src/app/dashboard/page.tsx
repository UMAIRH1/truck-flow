"use client";

import { useEffect, useState } from "react";
import { Header, MobileLayout } from "@/components/layout";
import { useRoutes } from "@/contexts/RouteContext";
import { useLoads } from "@/contexts/LoadContext";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, TrendingUp, Truck, User, MapPin, 
  Package, BarChart3
} from "lucide-react";

export default function DashboardPage() {
  const { routes } = useRoutes();
  const { loads } = useLoads();
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    calculateKPIs();
  }, [routes, loads]);

  const calculateKPIs = () => {
    // Filter completed routes
    const completedRoutes = routes.filter(r => r.status === 'completed');
    
    // Total metrics
    const totalRevenue = completedRoutes.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalCost = completedRoutes.reduce((sum, r) => sum + r.totalCost, 0);
    const totalProfit = totalRevenue - totalCost;
    const totalDistance = completedRoutes.reduce((sum, r) => sum + r.totalDistance, 0);
    const avgProfitPerKm = totalDistance > 0 ? totalProfit / totalDistance : 0;

    // Profit per route
    const profitPerRoute = completedRoutes.map(r => ({
      routeName: r.routeName,
      profit: r.profit,
      profitPerKm: r.profitPerKm,
      distance: r.totalDistance,
    })).sort((a, b) => b.profit - a.profit);

    // Profit per driver
    const driverProfits = new Map();
    completedRoutes.forEach(route => {
      const driverId = route.assignedDriver.id;
      const driverName = route.assignedDriver.name;
      if (!driverProfits.has(driverId)) {
        driverProfits.set(driverId, {
          name: driverName,
          profit: 0,
          routes: 0,
          distance: 0,
        });
      }
      const driver = driverProfits.get(driverId);
      driver.profit += route.profit;
      driver.routes += 1;
      driver.distance += route.totalDistance;
    });

    const profitPerDriver = Array.from(driverProfits.values())
      .sort((a, b) => b.profit - a.profit);

    // Profit per truck
    const truckProfits = new Map();
    completedRoutes.forEach(route => {
      const truckNumber = route.assignedTruck?.truckNumber || 'Unassigned';
      if (!truckProfits.has(truckNumber)) {
        truckProfits.set(truckNumber, {
          truckNumber,
          profit: 0,
          routes: 0,
          distance: 0,
        });
      }
      const truck = truckProfits.get(truckNumber);
      truck.profit += route.profit;
      truck.routes += 1;
      truck.distance += route.totalDistance;
    });

    const profitPerTruck = Array.from(truckProfits.values())
      .sort((a, b) => b.profit - a.profit);

    setKpis({
      totalRevenue,
      totalCost,
      totalProfit,
      totalDistance,
      avgProfitPerKm,
      completedRoutes: completedRoutes.length,
      activeRoutes: routes.filter(r => r.status === 'accepted' || r.status === 'in-progress').length,
      pendingRoutes: routes.filter(r => r.status === 'pending').length,
      profitPerRoute,
      profitPerDriver,
      profitPerTruck,
    });
  };

  if (!kpis) {
    return (
      <MobileLayout showFAB={true}>
        <Header title="Dashboard" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showFAB={true}>
      <Header title="Dashboard" showBack />
      <div className="px-4 py-6 max-w-7xl mx-auto space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    €{kpis.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-red-600">
                    €{kpis.totalCost.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Profit</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{kpis.totalProfit.toFixed(2)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg €/km</p>
                  <p className="text-2xl font-bold text-purple-600">
                    €{kpis.avgProfitPerKm.toFixed(2)}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Completed Routes</p>
                <p className="text-3xl font-bold text-gray-800">{kpis.completedRoutes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Active Routes</p>
                <p className="text-3xl font-bold text-blue-600">{kpis.activeRoutes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending Routes</p>
                <p className="text-3xl font-bold text-yellow-600">{kpis.pendingRoutes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit per Route */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Profit per Route
            </h2>
            {kpis.profitPerRoute.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No completed routes yet</p>
            ) : (
              <div className="space-y-3">
                {kpis.profitPerRoute.slice(0, 5).map((route: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{route.routeName}</div>
                      <div className="text-sm text-gray-600">
                        {route.distance} km • €{route.profitPerKm.toFixed(2)}/km
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      €{route.profit.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit per Driver */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Profit per Driver
            </h2>
            {kpis.profitPerDriver.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No driver data yet</p>
            ) : (
              <div className="space-y-3">
                {kpis.profitPerDriver.map((driver: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{driver.name}</div>
                      <div className="text-sm text-gray-600">
                        {driver.routes} routes • {driver.distance} km
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      €{driver.profit.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit per Truck */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Profit per Truck
            </h2>
            {kpis.profitPerTruck.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No truck data yet</p>
            ) : (
              <div className="space-y-3">
                {kpis.profitPerTruck.map((truck: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{truck.truckNumber}</div>
                      <div className="text-sm text-gray-600">
                        {truck.routes} routes • {truck.distance} km
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      €{truck.profit.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
