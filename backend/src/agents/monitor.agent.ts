import { Injectable } from '@nestjs/common';
import { IncidentService } from '../incidents/incident.service';
import { Incident, IncidentSeverity, IncidentStatus } from '../database/entities/incident.entity';

@Injectable()
export class MonitorAgent {
  constructor(private incidentService: IncidentService) {}

  async processAlert(alertData: any): Promise<Incident> {
    // Parse alert from monitoring system (Prometheus, Datadog, etc.)
    const severity = this.mapAlertSeverity(alertData.severity || alertData.labels?.severity);
    
    const incident = await this.incidentService.create({
      title: alertData.annotations?.summary || alertData.title || 'Alert received',
      description: alertData.annotations?.description || alertData.message || JSON.stringify(alertData),
      severity,
      source: alertData.source || 'prometheus',
      status: IncidentStatus.OPEN,
      metadata: {
        alertData,
        receivedAt: new Date().toISOString(),
      },
    });

    return incident;
  }

  private mapAlertSeverity(severity: string): IncidentSeverity {
    const severityMap: Record<string, IncidentSeverity> = {
      critical: IncidentSeverity.CRITICAL,
      warning: IncidentSeverity.HIGH,
      info: IncidentSeverity.MEDIUM,
      low: IncidentSeverity.LOW,
    };
    
    return severityMap[severity?.toLowerCase()] || IncidentSeverity.MEDIUM;
  }
}
