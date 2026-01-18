import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ActionService } from './action.service';
import { ActionController } from './action.controller';
import { Action } from '../database/entities/action.entity';
import { AgentModule } from '../agents/agent.module';
import { AuditModule } from '../audit/audit.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Action]),
    BullModule.registerQueue({ name: 'action-queue' }),
    AgentModule,
    AuditModule,
    WebSocketModule,
  ],
  controllers: [ActionController],
  providers: [ActionService],
  exports: [ActionService],
})
export class ActionModule {}
