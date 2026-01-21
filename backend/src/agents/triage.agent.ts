import { Injectable } from '@nestjs/common';
import { IncidentService } from '../incidents/incident.service';
import { Incident, IncidentStatus, IncidentSeverity } from '../database/entities/incident.entity';

@Injectable()
export class TriageAgent {
  constructor(private incidentService: IncidentService) {}

  async process(incidentId: string): Promise<void> {
    const incident = await this.incidentService.findById(incidentId);
    if (!incident) return;

    // AI-powered triage (simplified for MVP - can be enhanced with LLM)
    const triageResults = this.classifyIncident(incident);
    const suggestedRunbooks = this.suggestRunbooks(incident);

    await this.incidentService.update(incidentId, {
      status: IncidentStatus.TRIAGED,
      triageResults,
      suggestedRunbooks,
    });
  }

  private classifyIncident(incident: Incident): Record<string, any> {
    // Classification logic (can be enhanced with LLM)
    const keywords = incident.description.toLowerCase();
    
    let category = 'unknown';
    if (keywords.includes('cpu') || keywords.includes('memory')) {
      category = 'resource';
    } else if (keywords.includes('error') || keywords.includes('exception')) {
      category = 'application';
    } else if (keywords.includes('network') || keywords.includes('timeout')) {
      category = 'network';
    }

    return {
      category,
      confidence: 0.85,
      classificationTime: new Date().toISOString(),
    };
  }

  private suggestRunbooks(incident: Incident): string[] {
    // Suggest runbooks based on incident characteristics
    const suggestions: string[] = [];
    
    if (incident.severity === IncidentSeverity.CRITICAL) {
      suggestions.push('1. Check service health metrics');
      suggestions.push('2. Review recent deployments');
      suggestions.push('3. Scale service if CPU/memory high');
    } else {
      suggestions.push('1. Review logs for errors');
      suggestions.push('2. Check service dependencies');
    }

    return suggestions;
  }
}
