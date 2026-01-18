import { Module } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { KubernetesConnector } from './kubernetes.connector';

@Module({
  providers: [ConnectorService, KubernetesConnector],
  exports: [ConnectorService],
})
export class ConnectorModule {}
