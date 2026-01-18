import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AuditAction {
  INCIDENT_CREATED = 'incident_created',
  INCIDENT_UPDATED = 'incident_updated',
  ACTION_CREATED = 'action_created',
  ACTION_EXECUTED = 'action_executed',
  APPROVAL_GRANTED = 'approval_granted',
  APPROVAL_REJECTED = 'approval_rejected',
  USER_LOGIN = 'user_login',
  POLICY_VIOLATION = 'policy_violation',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  entityType: string; // 'incident', 'action', 'approval'

  @Column({ nullable: true })
  entityId: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('text', { nullable: true })
  description: string;

  @Column('inet', { nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
