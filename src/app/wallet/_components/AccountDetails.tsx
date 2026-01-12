import { Clock, CreditCard, DollarSign, Truck } from "lucide-react";
import { useLoads } from "@/contexts/LoadContext";
import { useAuth } from "@/contexts/AuthContext";
const AccountDetails = () => {
  const { loads } = useLoads();
  const { user } = useAuth();
  const driverLoads = loads.filter((load) => load.assignedDriver?.name === user?.name || load.assignedDriver?.id === user?.id);
  const completedLoads = driverLoads.filter((l) => l.status === "completed");
  const pendingLoads = driverLoads.filter((l) => l.status === "accepted" || l.status === "in-progress");
  const totalEarning = completedLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const pendingPayments = pendingLoads.reduce((sum, load) => sum + (load.driverPrice || 0), 0);
  const paidLoads = completedLoads.length;
  const cancelledAmount = 2000; // Mock data
  const accountData = [
    {
      icon: DollarSign,
      label: "Total Earning",
      value: totalEarning ,
    },
    {
      icon: Clock,
      label: "Pending Payments",
      value: pendingPayments || 3000,
    },
    {
      icon: Truck,
      label: "Paid Loads",
      value: paidLoads * 1000 || 9000,
    },
    {
      icon: CreditCard,
      label: "Cancelled Amount",
      value: cancelledAmount,
    },
  ];

  return (
    <div>
      <div className="bg-white rounded-xl p-4 md:p-6  mt-4">
        <h3 className="text-sm md:text-lg text-gray-500 md:text-gray-900 mb-3 md:mb-4">Account Details</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {accountData.map((item, index) => (
            <div key={index} className="shadow-md rounded-lg p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <item.icon className="h-4 md:h-5 w-4 md:w-5 text-gray-500" />
                <span className="text-xs md:text-sm text-gray-500">{item.label}</span>
              </div>
              <p className="font-semibold md:text-xl">$ {item.value.toLocaleString()}.00</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
