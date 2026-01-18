import { Injectable } from '@nestjs/common';
import { ActionService } from '../actions/action.service';
import { ConnectorService } from '../connectors/connector.service';
import { ActionStatus } from '../database/entities/action.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ExecutorAgent {
  constructor(
    private actionService: ActionService,
    private connectorService: ConnectorService,
    private auditService: AuditService,
  ) {}

  async execute(actionId: string, approvedBy: string): Promise<void> {
    const action = await this.actionService.findById(actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found`);
    }

    // Update status to executing
    await this.actionService.update(actionId, {
      status: ActionStatus.EXECUTING,
    });

    try {
      // Execute via appropriate connector
      let result: any;
      
      if (action.dryRun) {
        result = { message: 'DRY RUN: Action would be executed', dryRun: true };
      } else {
        result = await this.connectorService.execute(action);
      }

      // Update action with result
      await this.actionService.update(actionId, {
        status: ActionStatus.SUCCESS,
        result: JSON.stringify(result),
        executedAt: new Date(),
        executionLogs: {
          executedBy: approvedBy,
          executedAt: new Date().toISOString(),
          result,
        },
      });

      // Log audit
      await this.auditService.log({
        action: 'action_executed',
        userId: approvedBy,
        entityType: 'action',
        entityId: actionId,
        description: `Action ${action.type} executed successfully`,
        metadata: { actionId, result },
      });
    } catch (error: any) {
      await this.actionService.update(actionId, {
        status: ActionStatus.FAILED,
        result: error.message,
        executionLogs: {
          error: error.message,
          executedAt: new Date().toISOString(),
        },
      });

      // Log audit
      await this.auditService.log({
        action: 'action_executed',
        userId: approvedBy,
        entityType: 'action',
        entityId: actionId,
        description: `Action ${action.type} failed: ${error.message}`,
        metadata: { actionId, error: error.message },
      });

      throw error;
    }
  }
}
