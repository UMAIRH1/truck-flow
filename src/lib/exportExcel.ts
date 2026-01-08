import { Load } from '@/types';

/**
 * Export data to Excel (CSV format)
 * For a full Excel export, you would use a library like xlsx
 */
export function exportToExcel(data: any[], filename: string, headers?: string[]) {
  // Convert data to CSV format
  const csvHeaders = headers || Object.keys(data[0] || {});
  
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle special characters and commas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export loads to Excel
 */
export function exportLoadsToExcel(loads: Load[]) {
  const formattedData = loads.map(load => ({
    'Load ID': load.id,
    'Client': load.clientName,
    'Pickup': load.pickupLocation,
    'Dropoff': load.dropoffLocation,
    'Price': load.clientPrice,
    'Driver Price': load.driverPrice,
    'Driver': load.assignedDriver?.name || 'Unassigned',
    'Status': load.status,
    'Payment Terms': `${load.paymentTerms} days`,
    'Loading Date': new Date(load.loadingDate).toLocaleDateString(),
    'Expected Payout': new Date(load.expectedPayoutDate).toLocaleDateString(),
    'Weight (KG)': load.loadWeight,
  }));

  exportToExcel(formattedData, `loads_export_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export payments report to Excel
 */
export function exportPaymentsToExcel(loads: Load[]) {
  const completedLoads = loads.filter(l => l.status === 'completed');
  
  const formattedData = completedLoads.map(load => ({
    'Load ID': load.id,
    'Client': load.clientName,
    'Amount': load.clientPrice,
    'Driver Payment': load.driverPrice,
    'Profit': load.clientPrice - (load.driverPrice || 0) - (load.fuel || 0) - (load.tolls || 0) - (load.otherExpenses || 0),
    'Payment Terms': `${load.paymentTerms} days`,
    'Expected Payout': new Date(load.expectedPayoutDate).toLocaleDateString(),
    'Completed Date': load.completedAt ? new Date(load.completedAt).toLocaleDateString() : 'N/A',
  }));

  exportToExcel(formattedData, `payments_export_${new Date().toISOString().split('T')[0]}`);
}

/**
 * Export profit report to Excel
 */
export function exportProfitReportToExcel(loads: Load[]) {
  const completedLoads = loads.filter(l => l.status === 'completed');
  
  const totalIncome = completedLoads.reduce((sum, l) => sum + l.clientPrice, 0);
  const totalDriverCost = completedLoads.reduce((sum, l) => sum + (l.driverPrice || 0), 0);
  const totalFuel = completedLoads.reduce((sum, l) => sum + (l.fuel || 0), 0);
  const totalTolls = completedLoads.reduce((sum, l) => sum + (l.tolls || 0), 0);
  const totalOther = completedLoads.reduce((sum, l) => sum + (l.otherExpenses || 0), 0);
  const totalExpenses = totalDriverCost + totalFuel + totalTolls + totalOther;
  const netProfit = totalIncome - totalExpenses;

  const summaryData = [
    { 'Category': 'Total Income', 'Amount': totalIncome },
    { 'Category': 'Driver Costs', 'Amount': totalDriverCost },
    { 'Category': 'Fuel Expenses', 'Amount': totalFuel },
    { 'Category': 'Toll Expenses', 'Amount': totalTolls },
    { 'Category': 'Other Expenses', 'Amount': totalOther },
    { 'Category': 'Total Expenses', 'Amount': totalExpenses },
    { 'Category': 'Net Profit', 'Amount': netProfit },
    { 'Category': 'Completed Loads', 'Amount': completedLoads.length },
  ];

  exportToExcel(summaryData, `profit_report_${new Date().toISOString().split('T')[0]}`);
}
