import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ControllerAgent } from '../agents/controller.agent';
import { Logger } from '@nestjs/common';

@Controller('monitoring')
export class MonitoringController {
  private readonly logger = new Logger(MonitoringController.name);

  constructor(private controllerAgent: ControllerAgent) {}

  @Post('webhooks/prometheus')
  async handlePrometheusWebhook(@Body() body: any, @Headers() headers: any) {
    this.logger.log('Received Prometheus webhook');
    
    // Parse Prometheus alertmanager webhook format
    const alerts = body.alerts || [];
    
    for (const alert of alerts) {
      const alertData = {
        source: 'prometheus',
        title: alert.annotations?.summary || alert.labels?.alertname,
        message: alert.annotations?.description || '',
        severity: alert.labels?.severity || 'warning',
        labels: alert.labels,
        annotations: alert.annotations,
        status: alert.status,
        startsAt: alert.startsAt,
        endsAt: alert.endsAt,
      };

      await this.controllerAgent.handleAlert(alertData);
    }

    return { status: 'ok', processed: alerts.length };
  }

  @Post('webhooks/datadog')
  async handleDatadogWebhook(@Body() body: any, @Headers() headers: any) {
    this.logger.log('Received Datadog webhook');

    const alertData = {
      source: 'datadog',
      title: body.title || body.event?.title,
      message: body.text || body.event?.text,
      severity: body.priority || 'normal',
      event: body.event,
    };

    await this.controllerAgent.handleAlert(alertData);

    return { status: 'ok' };
  }

  @Post('webhooks/sentry')
  async handleSentryWebhook(@Body() body: any, @Headers() headers: any) {
    this.logger.log('Received Sentry webhook');

    const alertData = {
      source: 'sentry',
      title: body.message?.title || body.issue?.title,
      message: body.message?.message || body.issue?.culprit,
      severity: body.level || 'error',
      issue: body.issue,
    };

    await this.controllerAgent.handleAlert(alertData);

    return { status: 'ok' };
  }

  @Post('webhooks/generic')
  async handleGenericWebhook(@Body() body: any, @Headers() headers: any) {
    this.logger.log('Received generic webhook');

    await this.controllerAgent.handleAlert({
      source: headers['x-source'] || 'generic',
      ...body,
    });

    return { status: 'ok' };
  }
}
