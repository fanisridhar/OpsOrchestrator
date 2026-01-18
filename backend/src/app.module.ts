import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { DatabaseModule } from './database/database.module';
import { IncidentModule } from './incidents/incident.module';
import { AgentModule } from './agents/agent.module';
import { ActionModule } from './actions/action.module';
import { ApprovalModule } from './approvals/approval.module';
import { ConnectorModule } from './connectors/connector.module';
import { AuditModule } from './audit/audit.module';
import { WebSocketModule } from './websocket/websocket.module';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'opsuser',
      password: process.env.DATABASE_PASSWORD || 'opspass',
      database: process.env.DATABASE_NAME || 'ops_orchestrator',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UserModule,
    IncidentModule,
    AgentModule,
    ActionModule,
    ApprovalModule,
    ConnectorModule,
    AuditModule,
    WebSocketModule,
    MonitoringModule,
    CommonModule,
  ],
})
export class AppModule {}
