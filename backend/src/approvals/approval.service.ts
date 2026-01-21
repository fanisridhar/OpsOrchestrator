import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval, ApprovalStatus } from '../database/entities/approval.entity';
import { ActionService } from '../actions/action.service';
import { ActionStatus } from '../database/entities/action.entity';
import { ExecutorAgent } from '../agents/executor.agent';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../database/entities/user.entity';
import { PolicyService } from '../common/policy.service';
import { AuditAction } from '../database/entities/audit-log.entity';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(Approval)
    private approvalRepository: Repository<Approval>,
    private actionService: ActionService,
    private executorAgent: ExecutorAgent,
    private websocketGateway: WebSocketGateway,
    private auditService: AuditService,
    private policyService: PolicyService,
  ) {}

  async create(data: Partial<Approval>): Promise<Approval> {
    const approval = this.approvalRepository.create(data);
    return this.approvalRepository.save(approval);
  }

  async findById(id: string): Promise<Approval | null> {
    return this.approvalRepository.findOne({
      where: { id },
      relations: ['action', 'approver'],
    });
  }

  async approve(
    approvalId: string,
    userId: string,
    userRole: UserRole,
    comment?: string,
  ): Promise<Approval> {
    const approval = await this.findById(approvalId);
    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    // Check policy compliance
    const action = await this.actionService.findById(approval.actionId);
    if (!action) {
      throw new Error(`Action ${approval.actionId} not found`);
    }

    // Policy checks
    const canApprove = await this.policyService.canApproveAction(
      action,
      userRole,
    );
    if (!canApprove) {
      throw new UnauthorizedException('Not authorized to approve this action');
    }

    // Update approval
    approval.status = ApprovalStatus.APPROVED;
    approval.approverId = userId;
    approval.comment = comment;
    approval.reviewedAt = new Date();
    await this.approvalRepository.save(approval);

    // Update action status
    await this.actionService.update(approval.actionId, {
      status: ActionStatus.APPROVED,
    });

    // Execute action
    await this.executorAgent.execute(approval.actionId, userId);

    // Emit real-time event
    this.websocketGateway.broadcastApprovalUpdate(approval);

    // Log audit
    await this.auditService.log({
      action: AuditAction.APPROVAL_GRANTED,
      userId,
      entityType: 'approval',
      entityId: approvalId,
      description: `Action ${action.type} approved`,
      metadata: { approvalId, actionId: action.id, comment },
    });

    return approval;
  }

  async reject(
    approvalId: string,
    userId: string,
    comment?: string,
  ): Promise<Approval> {
    const approval = await this.findById(approvalId);
    if (!approval) {
      throw new Error(`Approval ${approvalId} not found`);
    }

    approval.status = ApprovalStatus.REJECTED;
    approval.approverId = userId;
    approval.comment = comment;
    approval.reviewedAt = new Date();
    await this.approvalRepository.save(approval);

    // Update action status
    await this.actionService.update(approval.actionId, {
      status: ActionStatus.REJECTED,
    });

    // Emit real-time event
    this.websocketGateway.broadcastApprovalUpdate(approval);

    // Log audit
    await this.auditService.log({
      action: AuditAction.APPROVAL_REJECTED,
      userId,
      entityType: 'approval',
      entityId: approvalId,
      description: `Action rejected`,
      metadata: { approvalId, comment },
    });

    return approval;
  }
}
