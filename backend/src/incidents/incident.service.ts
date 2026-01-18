import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, IncidentStatus, IncidentSeverity } from '../database/entities/incident.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class IncidentService {
  constructor(
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    private websocketGateway: WebSocketGateway,
  ) {}

  async create(data: Partial<Incident>): Promise<Incident> {
    const incident = this.incidentRepository.create(data);
    const saved = await this.incidentRepository.save(incident);
    
    // Emit real-time event
    this.websocketGateway.broadcastIncidentUpdate(saved);
    
    return saved;
  }

  async findAll(): Promise<Incident[]> {
    return this.incidentRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['assignedTo', 'actions'],
    });
  }

  async findById(id: string): Promise<Incident | null> {
    return this.incidentRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'actions', 'actions.approval'],
    });
  }

  async update(id: string, data: Partial<Incident>): Promise<Incident> {
    await this.incidentRepository.update(id, data);
    const updated = await this.findById(id);
    
    if (updated) {
      this.websocketGateway.broadcastIncidentUpdate(updated);
    }
    
    return updated;
  }

  async updateStatus(
    id: string,
    status: IncidentStatus,
    resolvedAt?: Date,
  ): Promise<Incident> {
    const updateData: any = { status };
    if (status === IncidentStatus.RESOLVED && resolvedAt) {
      updateData.resolvedAt = resolvedAt;
    }
    return this.update(id, updateData);
  }
}
