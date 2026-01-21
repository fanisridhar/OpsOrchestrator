import * as api from '../api';

// Mock axios module
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
    },
  };
});

const axios = require('axios');
const mockAxiosInstance = axios.default.create();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should call login endpoint and store token', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await api.login('test@example.com', 'password123');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getIncidents', () => {
    it('should fetch incidents', async () => {
      const mockIncidents = [
        { id: '1', title: 'Incident 1' },
        { id: '2', title: 'Incident 2' },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockIncidents });

      const result = await api.getIncidents();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/incidents');
      expect(result).toEqual(mockIncidents);
    });
  });

  describe('getIncident', () => {
    it('should fetch a single incident', async () => {
      const mockIncident = { id: '1', title: 'Test Incident' };

      mockAxiosInstance.get.mockResolvedValue({ data: mockIncident });

      const result = await api.getIncident('1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/incidents/1');
      expect(result).toEqual(mockIncident);
    });
  });

  describe('createAction', () => {
    it('should create an action', async () => {
      const actionData = {
        incidentId: '1',
        type: 'scale_deployment',
        parameters: { namespace: 'default', deployment: 'app', replicas: 3 },
      };

      const mockAction = { id: '1', ...actionData };

      mockAxiosInstance.post.mockResolvedValue({ data: mockAction });

      const result = await api.createAction(actionData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/actions', actionData);
      expect(result).toEqual(mockAction);
    });
  });
});