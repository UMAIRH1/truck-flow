export interface Route {
  id: string;
  routeName: string;
  routeNumber: string;
  assignedDriver: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignedTruck?: {
    truckNumber?: string;
    truckType?: string;
    capacity?: number;
  };
  startDate: Date;
  endDate?: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'completed';
  loads: any[]; // Load IDs or populated loads
  totalDistance: number;
  fuelConsumption: number;
  fuelPricePerLiter: number;
  driverDailyCost: number;
  truckCostPerKm: number;
  fuelCost: number;
  driverCost: number;
  truckCost: number;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  profitPerKm: number;
  tolls: number;
  otherExpenses: number;
  notes?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
