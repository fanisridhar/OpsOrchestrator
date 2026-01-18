'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import IncidentDetail from '@/components/IncidentDetail';
import { getIncident } from '@/lib/api';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [incident, setIncident] = useState<any>(null);
  const [loadingIncident, setLoadingIncident] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (params.id) {
      loadIncident(params.id as string);
    }
  }, [params.id]);

  const loadIncident = async (id: string) => {
    try {
      setLoadingIncident(true);
      const data = await getIncident(id);
      setIncident(data);
    } catch (error) {
      console.error('Failed to load incident:', error);
    } finally {
      setLoadingIncident(false);
    }
  };

  if (loading || loadingIncident) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!incident) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Incident not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <IncidentDetail incident={incident} onUpdate={loadIncident} />
    </DashboardLayout>
  );
}
