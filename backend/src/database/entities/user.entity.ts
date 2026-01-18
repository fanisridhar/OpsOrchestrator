import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Incident } from './incident.entity';
import { Approval } from './approval.entity';

export enum UserRole {
  ADMIN = 'admin',
  ON_CALL = 'on_call',
  SENIOR_ON_CALL = 'senior_on_call',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Incident, (incident) => incident.assignedTo)
  incidents: Incident[];

  @OneToMany(() => Approval, (approval) => approval.approver)
  approvals: Approval[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
