import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { Approval, ApprovalStatus } from '../database/entities/approval.entity';
import { ActionModule } from '../actions/action.module';
import { AgentModule } from '../agents/agent.module';
import { AuditModule } from '../audit/audit.module';
import { CommonModule } from '../common/common.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Approval]),
    ActionModule,
    AgentModule,
    AuditModule,
    CommonModule,
    WebSocketModule,
  ],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
