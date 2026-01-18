import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Incident } from './incident.entity';
import { Approval } from './approval.entity';

export enum ActionType {
  SCALE_DEPLOYMENT = 'scale_deployment',
  RESTART_POD = 'restart_pod',
  REVERT_DEPLOY = 'revert_deploy',
  RUN_SCRIPT = 'run_script',
  ROLLBACK = 'rollback',
}

export enum ActionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXECUTING = 'executing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('actions')
export class Action {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  type: ActionType;

  @Column({
    type: 'enum',
    enum: ActionStatus,
    default: ActionStatus.PENDING,
  })
  status: ActionStatus;

  @Column('jsonb')
  parameters: Record<string, any>;

  @Column('text', { nullable: true })
  command: string;

  @ManyToOne(() => Incident, (incident) => incident.actions)
  @JoinColumn({ name: 'incident_id' })
  incident: Incident;

  @Column()
  incidentId: string;

  @OneToOne(() => Approval, (approval) => approval.action)
  approval: Approval;

  @Column('text', { nullable: true })
  result: string;

  @Column('jsonb', { nullable: true })
  executionLogs: Record<string, any>;

  @Column({ default: false })
  dryRun: boolean;

  @Column({ nullable: true })
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
