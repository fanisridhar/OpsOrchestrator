'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { getIncidents } from '@/lib/api';
import { useWebSocket } from '@/context/WebSocketContext';

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
};

const statusColors: Record<string, string> = {
  open: 'bg-gray-100 text-gray-800',
  triaged: 'bg-blue-100 text-blue-800',
  investigating: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

export default function IncidentList() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { socket } = useWebSocket();

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleIncidentUpdate = (incident: any) => {
      setIncidents((prev) => {
        const index = prev.findIndex((i) => i.id === incident.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = incident;
          return updated;
        } else {
          return [incident, ...prev];
        }
      });
    };

    socket.on('incident:update', handleIncidentUpdate);

    return () => {
      socket.off('incident:update', handleIncidentUpdate);
    };
  }, [socket]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Incidents</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {incidents.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No incidents found
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {incident.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        severityColors[incident.severity] || severityColors.medium
                      }`}
                    >
                      {incident.severity}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColors[incident.status] || statusColors.open
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {incident.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {format(new Date(incident.createdAt), 'PPp')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
