'use client';

import React, { useState } from 'react';
import { Header, MobileLayout } from '@/components/layout';
import { DriverLoadCard, FilterTabs } from '@/components/shared';
import { useLoads } from '@/contexts/LoadContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MyLoadsPage() {
  const { loads, updateLoadStatus } = useLoads();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');

  // Filter loads for this driver
  const driverLoads = loads.filter(load => 
    load.assignedDriver?.name === user?.name || 
    load.assignedDriver?.id === user?.id ||
    load.status === 'pending' // Show all pending loads for demo
  );

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'Completed' },
  ];

  const filteredLoads = driverLoads.filter(load => {
    if (activeTab === 'pending') return load.status === 'pending';
    if (activeTab === 'accepted') return load.status === 'accepted' || load.status === 'in-progress';
    if (activeTab === 'completed') return load.status === 'completed';
    return true;
  });

  const handleAccept = (loadId: string) => {
    updateLoadStatus(loadId, 'accepted');
  };

  const handleDecline = (loadId: string) => {
    updateLoadStatus(loadId, 'rejected');
  };

  const handleMapView = (loadId: string) => {
    router.push(`/map/${loadId}`);
  };

  return (
    <MobileLayout>
      <Header title="My Loads" showBack />
      
      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        <FilterTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="space-y-3">
          {filteredLoads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No loads found
            </div>
          ) : (
            filteredLoads.map((load) => (
              <DriverLoadCard
                key={load.id}
                load={load}
                showActions={activeTab === 'pending'}
                onAccept={() => handleAccept(load.id)}
                onDecline={() => handleDecline(load.id)}
                onMapView={() => handleMapView(load.id)}
              />
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
