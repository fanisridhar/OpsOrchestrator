'use client';

import { useEffect, useState } from 'react';
import { getIncidents } from '@/lib/api';

export default function IncidentDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    triaged: 0,
    investigating: 0,
    resolved: 0,
    critical: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const incidents = await getIncidents();
      setStats({
        total: incidents.length,
        open: incidents.filter((i: any) => i.status === 'open').length,
        triaged: incidents.filter((i: any) => i.status === 'triaged').length,
        investigating: incidents.filter((i: any) => i.status === 'investigating').length,
        resolved: incidents.filter((i: any) => i.status === 'resolved').length,
        critical: incidents.filter((i: any) => i.severity === 'critical').length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const statCards = [
    { label: 'Total Incidents', value: stats.total, color: 'bg-gray-500' },
    { label: 'Open', value: stats.open, color: 'bg-blue-500' },
    { label: 'Triaged', value: stats.triaged, color: 'bg-purple-500' },
    { label: 'Investigating', value: stats.investigating, color: 'bg-yellow-500' },
    { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' },
    { label: 'Critical', value: stats.critical, color: 'bg-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                <span className="text-white font-bold text-xl">{stat.value}</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.label}
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
