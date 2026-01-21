import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionService } from './action.service';
import { Action, ActionStatus, ActionType } from '../database/entities/action.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../database/entities/audit-log.entity';

describe('ActionService', () => {
  let service: ActionService;
  let repository: Repository<Action>;
  let websocketGateway: WebSocketGateway;
  let auditService: AuditService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockWebSocketGateway = {
    broadcastActionUpdate: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionService,
        {
          provide: getRepositoryToken(Action),
          useValue: mockRepository,
        },
        {
          provide: WebSocketGateway,
          useValue: mockWebSocketGateway,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<ActionService>(ActionService);
    repository = module.get<Repository<Action>>(getRepositoryToken(Action));
    websocketGateway = module.get<WebSocketGateway>(WebSocketGateway);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new action', async () => {
      const actionData: Partial<Action> = {
        type: ActionType.SCALE_DEPLOYMENT,
        status: ActionStatus.PENDING,
        parameters: { namespace: 'default', deployment: 'app', replicas: 3 },
        incidentId: 'incident-1',
      };

      const createdAction = { id: '1', ...actionData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(createdAction);
      mockRepository.save.mockResolvedValue(createdAction);
      mockAuditService.log.mockResolvedValue({});

      const result = await service.create(actionData);

      expect(mockRepository.create).toHaveBeenCalledWith(actionData);
      expect(mockRepository.save).toHaveBeenCalledWith(createdAction);
      expect(mockWebSocketGateway.broadcastActionUpdate).toHaveBeenCalledWith(createdAction);
      expect(mockAuditService.log).toHaveBeenCalledWith({
        action: AuditAction.ACTION_CREATED,
        entityType: 'action',
        entityId: createdAction.id,
        description: expect.any(String),
        metadata: expect.any(Object),
      });
      expect(result).toEqual(createdAction);
    });
  });

  describe('findById', () => {
    it('should return an action by id', async () => {
      const id = '1';
      const action = { id, type: ActionType.SCALE_DEPLOYMENT };
      mockRepository.findOne.mockResolvedValue(action);

      const result = await service.findById(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['incident', 'approval'],
      });
      expect(result).toEqual(action);
    });
  });
});