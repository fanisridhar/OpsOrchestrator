import { Injectable } from '@nestjs/common';
import { Action, ActionType } from '../database/entities/action.entity';
import { KubernetesConnector } from './kubernetes.connector';

@Injectable()
export class ConnectorService {
  constructor(private kubernetesConnector: KubernetesConnector) {}

  async execute(action: Action): Promise<any> {
    switch (action.type) {
      case ActionType.SCALE_DEPLOYMENT:
      case ActionType.RESTART_POD:
        return this.kubernetesConnector.execute(action);
      
      case ActionType.REVERT_DEPLOY:
      case ActionType.ROLLBACK:
        // Implement other connectors as needed
        throw new Error(`Action type ${action.type} not yet implemented`);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }
}
