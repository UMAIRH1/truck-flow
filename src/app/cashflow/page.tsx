'use client';

import React, { useState } from 'react';
import { Header, MobileLayout } from '@/components/layout';
import { FilterTabs, CashflowCard } from '@/components/shared';
import { CashflowItem } from '@/types';

// Mock cashflow data
const mockCashflowData: CashflowItem[] = [
  {
    id: 'c1',
    type: 'client',
    name: 'ACME Logistics',
    amount: 6000,
    since: new Date('2025-12-16'),
    expected: new Date('2026-01-16'),
    status: 'overdue',
    daysOverdue: 7,
  },
  {
    id: 'c2',
    type: 'client',
    name: 'TechTie Ltd.',
    amount: 4500,
    since: new Date('2025-11-25'),
    expected: new Date('2026-01-06'),
    status: 'due-this-week',
    daysOverdue: -5,
  },
  {
    id: 'c3',
    type: 'client',
    name: 'ACME Logistics',
    amount: 6000,
    since: new Date('2025-12-16'),
    expected: new Date('2026-01-16'),
    status: 'overdue',
    daysOverdue: 7,
  },
  {
    id: 'c4',
    type: 'client',
    name: 'TechTie Ltd.',
    amount: 4500,
    since: new Date('2025-11-25'),
    expected: new Date('2026-01-06'),
    status: 'due-this-week',
    daysOverdue: -5,
  },
  {
    id: 'c5',
    type: 'partner',
    name: 'TechTie Ltd.',
    amount: 4500,
    since: new Date('2025-11-25'),
    expected: new Date('2026-01-06'),
    status: 'due-this-week',
    daysOverdue: -5,
  },
];

export default function CashflowPage() {
  const [activeTab, setActiveTab] = useState('outstanding');

  const tabs = [
    { id: 'outstanding', label: 'Outstanding' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'due-this-week', label: 'Due this week' },
  ];

  // Calculate totals
  const clientsTotal = mockCashflowData
    .filter(c => c.type === 'client')
    .reduce((sum, c) => sum + c.amount, 0);
  const partnersTotal = mockCashflowData
    .filter(c => c.type === 'partner')
    .reduce((sum, c) => sum + c.amount, 0);

  const filteredItems = mockCashflowData.filter(item => {
    if (activeTab === 'outstanding') return true;
    return item.status === activeTab;
  });

  // Calculate tab totals
  const outstandingTotal = mockCashflowData.reduce((sum, c) => sum + c.amount, 0);
  const overdueTotal = mockCashflowData
    .filter(c => c.status === 'overdue')
    .reduce((sum, c) => sum + c.amount, 0);
  const dueThisWeekTotal = mockCashflowData
    .filter(c => c.status === 'due-this-week')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <MobileLayout showFAB={false}>
      <Header title="Cashflow" showBack />
      
      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Summary Cards */}
        <div className="flex gap-3">
          <div className="flex-1 bg-green-600 text-white rounded-xl p-4">
            <p className="text-sm opacity-90">Clients (Cash In)</p>
            <p className="text-lg font-bold mt-1">$ {clientsTotal.toLocaleString()}.00</p>
          </div>
          <div className="flex-1 bg-red-500 text-white rounded-xl p-4">
            <p className="text-sm opacity-90">Partners (Cash Out)</p>
            <p className="text-lg font-bold mt-1">$ {partnersTotal.toLocaleString()}.00</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Amount Summary */}
        <div className="flex gap-4 px-2">
          <span className="text-sm font-bold">$ {outstandingTotal.toLocaleString()}.00</span>
          <span className="text-sm text-gray-500">$ {overdueTotal.toLocaleString()}.00</span>
          <span className="text-sm text-gray-500">$ {dueThisWeekTotal.toLocaleString()}.00</span>
        </div>

        {/* Cashflow Items */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <CashflowCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
