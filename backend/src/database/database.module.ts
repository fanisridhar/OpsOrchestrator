import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Incident } from './entities/incident.entity';
import { Action } from './entities/action.entity';
import { Approval } from './entities/approval.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Policy } from './entities/policy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Incident,
      Action,
      Approval,
      AuditLog,
      Policy,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
