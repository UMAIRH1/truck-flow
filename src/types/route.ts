export interface Route {
  id: string;
  routeName: string;
  routeNumber: string;
  origin?: string;
  destination?: string;
  driverStartingLocation?: string; // Driver's current position when route is created
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  driverStartingCoords?: { lat: number; lng: number };
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
  loadSequence?: string[]; // Ordered array of load IDs representing the sequence
  totalDistance: number;
  preRouteDistance?: number; // Distance from driver starting location to route origin
  routeDistance?: number; // Distance from origin through all waypoints to destination
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
  podImage?: string;
  invoices?: string[];
  documents?: string[];
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
