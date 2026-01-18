import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControllerAgent } from './controller.agent';
import { MonitorAgent } from './monitor.agent';
import { TriageAgent } from './triage.agent';
import { ExecutorAgent } from './executor.agent';
import { InvestigatorAgent } from './investigator.agent';
import { Incident } from '../database/entities/incident.entity';
import { ActionModule } from '../actions/action.module';
import { ConnectorModule } from '../connectors/connector.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident]),
    BullModule.registerQueue(
      { name: 'incident-queue' },
      { name: 'action-queue' },
    ),
    ActionModule,
    ConnectorModule,
  ],
  providers: [
    ControllerAgent,
    MonitorAgent,
    TriageAgent,
    ExecutorAgent,
    InvestigatorAgent,
  ],
  exports: [
    ControllerAgent,
    MonitorAgent,
    TriageAgent,
    ExecutorAgent,
    InvestigatorAgent,
  ],
})
export class AgentModule {}
