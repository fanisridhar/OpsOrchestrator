import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { IncidentService } from './incident.service';
import { IncidentController } from './incident.controller';
import { Incident } from '../database/entities/incident.entity';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident]),
    BullModule.registerQueue({ name: 'incident-queue' }),
    WebSocketModule,
  ],
  controllers: [IncidentController],
  providers: [IncidentService],
  exports: [IncidentService],
})
export class IncidentModule {}
