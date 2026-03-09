import { Clock, DollarSign, Truck, XCircle } from "lucide-react";
import { useLoads } from "@/contexts/LoadContext";
import { useAuth } from "@/contexts/AuthContext";

const AccountDetails = () => {
  const { loads } = useLoads();
  const { user } = useAuth();
  
  // Filter loads for current driver
  const driverLoads = loads.filter((load) => 
    load.assignedDriver?.name === user?.name || load.assignedDriver?.id === user?.id
  );
  
  const completedLoads = driverLoads.filter((l) => l.status === "completed");
  const pendingLoads = driverLoads.filter((l) => l.status === "accepted" || l.status === "in-progress");
  const rejectedLoads = driverLoads.filter((l) => l.status === "rejected");
  
  // Calculate real values
  const totalEarning = completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const pendingPayments = pendingLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const completedCount = completedLoads.length;
  const rejectedAmount = rejectedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  
  const accountData = [
    {
      icon: DollarSign,
      label: "Total Earning",
      value: totalEarning,
    },
    {
      icon: Clock,
      label: "Pending Payments",
      value: pendingPayments,
    },
    {
      icon: Truck,
      label: "Completed Loads",
      value: completedCount,
      isCount: true,
    },
    {
      icon: XCircle,
      label: "Rejected Amount",
      value: rejectedAmount,
    },
  ];

  return (
    <div>
      <div className="bg-white rounded-xl p-4 md:p-6 mt-4">
        <h3 className="text-sm md:text-lg text-gray-500 md:text-gray-900 mb-3 md:mb-4">Account Details</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {accountData.map((item, index) => (
            <div key={index} className="shadow-md rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <item.icon className="h-4 md:h-5 w-4 md:w-5 text-gray-500" />
                <span className="text-xs md:text-sm text-gray-500">{item.label}</span>
              </div>
              <p className="font-semibold md:text-xl">
                {item.isCount ? item.value : `€${item.value.toLocaleString()}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
