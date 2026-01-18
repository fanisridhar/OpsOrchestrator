import { Injectable } from '@nestjs/common';
import { IncidentService } from '../incidents/incident.service';

@Injectable()
export class InvestigatorAgent {
  constructor(private incidentService: IncidentService) {}

  async investigate(incidentId: string): Promise<void> {
    const incident = await this.incidentService.findById(incidentId);
    if (!incident) return;

    // Automated root cause investigation (simplified for MVP)
    const rootCause = this.analyzeRootCause(incident);

    await this.incidentService.update(incidentId, {
      rootCause,
    });
  }

  private analyzeRootCause(incident: any): string {
    // Simplified root cause analysis
    // In production, this could query logs, traces, metrics
    const metadata = incident.metadata || {};
    const alertData = metadata.alertData || {};
    
    let analysis = 'Root cause analysis:\n';
    analysis += `- Incident source: ${incident.source}\n`;
    analysis += `- Severity: ${incident.severity}\n`;
    
    if (alertData.labels) {
      analysis += `- Labels: ${JSON.stringify(alertData.labels)}\n`;
    }

    // Could enhance with log search, flamegraphs, trace analysis
    analysis += '- Recommendation: Review recent deployments and service dependencies';

    return analysis;
  }
}
