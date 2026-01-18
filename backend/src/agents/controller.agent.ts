import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IncidentService } from '../incidents/incident.service';
import { MonitorAgent } from './monitor.agent';
import { TriageAgent } from './triage.agent';
import { ExecutorAgent } from './executor.agent';
import { InvestigatorAgent } from './investigator.agent';

@Injectable()
export class ControllerAgent {
  constructor(
    @InjectQueue('incident-queue') private incidentQueue: Queue,
    @InjectQueue('action-queue') private actionQueue: Queue,
    private incidentService: IncidentService,
    private monitorAgent: MonitorAgent,
    private triageAgent: TriageAgent,
    private executorAgent: ExecutorAgent,
    private investigatorAgent: InvestigatorAgent,
  ) {}

  async handleAlert(alertData: any): Promise<string> {
    // 1. Monitor agent creates incident
    const incident = await this.monitorAgent.processAlert(alertData);
    
    // 2. Queue triage task
    await this.incidentQueue.add('triage', {
      incidentId: incident.id,
    });

    return incident.id;
  }

  async processIncident(incidentId: string): Promise<void> {
    const incident = await this.incidentService.findById(incidentId);
    if (!incident) return;

    // Route to appropriate agents based on incident status
    switch (incident.status) {
      case 'open':
        await this.triageAgent.process(incidentId);
        break;
      case 'triaged':
        // Auto-assign or wait for human
        break;
      case 'investigating':
        await this.investigatorAgent.investigate(incidentId);
        break;
    }
  }

  async executeAction(actionId: string, approvedBy: string): Promise<void> {
    await this.actionQueue.add('execute', {
      actionId,
      approvedBy,
    });
  }
}
