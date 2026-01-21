import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentService } from './incident.service';
import { Incident, IncidentStatus, IncidentSeverity } from '../database/entities/incident.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';

describe('IncidentService', () => {
  let service: IncidentService;
  let repository: Repository<Incident>;
  let websocketGateway: WebSocketGateway;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockWebSocketGateway = {
    broadcastIncidentUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentService,
        {
          provide: getRepositoryToken(Incident),
          useValue: mockRepository,
        },
        {
          provide: WebSocketGateway,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<IncidentService>(IncidentService);
    repository = module.get<Repository<Incident>>(getRepositoryToken(Incident));
    websocketGateway = module.get<WebSocketGateway>(WebSocketGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new incident', async () => {
      const incidentData = {
        title: 'Test Incident',
        description: 'Test Description',
        severity: IncidentSeverity.MEDIUM,
        source: 'prometheus',
        status: IncidentStatus.OPEN,
      };

      const createdIncident = { id: '1', ...incidentData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(createdIncident);
      mockRepository.save.mockResolvedValue(createdIncident);

      const result = await service.create(incidentData);

      expect(mockRepository.create).toHaveBeenCalledWith(incidentData);
      expect(mockRepository.save).toHaveBeenCalledWith(createdIncident);
      expect(mockWebSocketGateway.broadcastIncidentUpdate).toHaveBeenCalledWith(createdIncident);
      expect(result).toEqual(createdIncident);
    });
  });

  describe('findAll', () => {
    it('should return all incidents', async () => {
      const incidents = [
        { id: '1', title: 'Incident 1' },
        { id: '2', title: 'Incident 2' },
      ];
      mockRepository.find.mockResolvedValue(incidents);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        relations: ['assignedTo', 'actions'],
      });
      expect(result).toEqual(incidents);
    });
  });

  describe('findById', () => {
    it('should return an incident by id', async () => {
      const id = '1';
      const incident = { id, title: 'Test Incident' };
      mockRepository.findOne.mockResolvedValue(incident);

      const result = await service.findById(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['assignedTo', 'actions', 'actions.approval'],
      });
      expect(result).toEqual(incident);
    });
  });

  describe('updateStatus', () => {
    it('should update incident status', async () => {
      const id = '1';
      const status = IncidentStatus.RESOLVED;
      const resolvedAt = new Date();
      const updatedIncident = { id, status, resolvedAt };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedIncident);
      mockWebSocketGateway.broadcastIncidentUpdate.mockImplementation(() => {});

      const result = await service.updateStatus(id, status, resolvedAt);

      expect(mockRepository.update).toHaveBeenCalledWith(id, { status, resolvedAt });
      expect(result).toEqual(updatedIncident);
    });
  });
});