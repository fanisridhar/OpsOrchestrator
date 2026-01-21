import { Test, TestingModule } from '@nestjs/testing';
import { MonitorAgent } from './monitor.agent';
import { IncidentService } from '../incidents/incident.service';
import { Incident, IncidentStatus, IncidentSeverity } from '../database/entities/incident.entity';

describe('MonitorAgent', () => {
  let agent: MonitorAgent;
  let incidentService: IncidentService;

  const mockIncidentService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorAgent,
        {
          provide: IncidentService,
          useValue: mockIncidentService,
        },
      ],
    }).compile();

    agent = module.get<MonitorAgent>(MonitorAgent);
    incidentService = module.get<IncidentService>(IncidentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(agent).toBeDefined();
  });

  describe('processAlert', () => {
    it('should create an incident from alert data', async () => {
      const alertData = {
        annotations: {
          summary: 'High CPU Usage',
          description: 'CPU usage is above 90%',
        },
        labels: {
          severity: 'critical',
        },
        source: 'prometheus',
      };

      const expectedIncident: Partial<Incident> = {
        title: 'High CPU Usage',
        description: 'CPU usage is above 90%',
        severity: IncidentSeverity.CRITICAL,
        source: 'prometheus',
        status: IncidentStatus.OPEN,
        metadata: {
          alertData,
          receivedAt: expect.any(String),
        },
      };

      const createdIncident = { id: '1', ...expectedIncident };
      mockIncidentService.create.mockResolvedValue(createdIncident);

      const result = await agent.processAlert(alertData);

      expect(mockIncidentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'High CPU Usage',
          description: 'CPU usage is above 90%',
          severity: IncidentSeverity.CRITICAL,
          source: 'prometheus',
          status: IncidentStatus.OPEN,
        }),
      );
      expect(result).toEqual(createdIncident);
    });

    it('should map severity correctly', async () => {
      const alertData = {
        labels: { severity: 'warning' },
        source: 'prometheus',
      };

      const createdIncident = { id: '1', severity: IncidentSeverity.HIGH };
      mockIncidentService.create.mockResolvedValue(createdIncident);

      await agent.processAlert(alertData);

      expect(mockIncidentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: IncidentSeverity.HIGH,
        }),
      );
    });
  });
});