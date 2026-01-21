import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Action, ActionStatus, ActionType } from '../database/entities/action.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../database/entities/audit-log.entity';

@Injectable()
export class ActionService {
  constructor(
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    private websocketGateway: WebSocketGateway,
    private auditService: AuditService,
  ) {}

  async create(data: Partial<Action>): Promise<Action> {
    const action = this.actionRepository.create(data);
    const saved = await this.actionRepository.save(action);
    
    // Emit real-time event
    this.websocketGateway.broadcastActionUpdate(saved);
    
    // Log audit
    await this.auditService.log({
      action: AuditAction.ACTION_CREATED,
      entityType: 'action',
      entityId: saved.id,
      description: `Action ${saved.type} created for incident ${saved.incidentId}`,
      metadata: { actionId: saved.id, type: saved.type },
    });
    
    return saved;
  }

  async findById(id: string): Promise<Action | null> {
    return this.actionRepository.findOne({
      where: { id },
      relations: ['incident', 'approval'],
    });
  }

  async findByIncidentId(incidentId: string): Promise<Action[]> {
    return this.actionRepository.find({
      where: { incidentId },
      order: { createdAt: 'DESC' },
      relations: ['approval'],
    });
  }

  async update(id: string, data: Partial<Action>): Promise<Action> {
    await this.actionRepository.update(id, data);
    const updated = await this.findById(id);
    
    if (updated) {
      this.websocketGateway.broadcastActionUpdate(updated);
    }
    
    return updated;
  }
}
