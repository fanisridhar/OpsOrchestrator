import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { AgentModule } from '../agents/agent.module';
import { IncidentModule } from '../incidents/incident.module';

@Module({
  imports: [AgentModule, IncidentModule],
  controllers: [MonitoringController],
})
export class MonitoringModule {}
