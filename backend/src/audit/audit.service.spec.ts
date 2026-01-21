import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog, AuditAction } from '../database/entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: Repository<AuditLog>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const auditData = {
        action: AuditAction.ACTION_CREATED,
        userId: 'user-1',
        entityType: 'action',
        entityId: 'action-1',
        description: 'Action created',
        metadata: { test: 'data' },
      };

      const createdLog = { id: '1', ...auditData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(createdLog);
      mockRepository.save.mockResolvedValue(createdLog);

      const result = await service.log(auditData);

      expect(mockRepository.create).toHaveBeenCalledWith(auditData);
      expect(mockRepository.save).toHaveBeenCalledWith(createdLog);
      expect(result).toEqual(createdLog);
    });
  });

  describe('findAll', () => {
    it('should return all audit logs', async () => {
      const logs = [
        { id: '1', action: AuditAction.ACTION_CREATED },
        { id: '2', action: AuditAction.APPROVAL_GRANTED },
      ];
      mockRepository.find.mockResolvedValue(logs);

      const result = await service.findAll(100);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 100,
      });
      expect(result).toEqual(logs);
    });
  });
});