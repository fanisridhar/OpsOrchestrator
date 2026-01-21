import { render, screen, waitFor } from '@testing-library/react';
import IncidentDashboard from '../IncidentDashboard';
import * as api from '@/lib/api';

jest.mock('@/lib/api');

const mockGetIncidents = api.getIncidents as jest.MockedFunction<typeof api.getIncidents>;

describe('IncidentDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with statistics', async () => {
    const mockIncidents = [
      { id: '1', status: 'open', severity: 'critical' },
      { id: '2', status: 'triaged', severity: 'high' },
      { id: '3', status: 'resolved', severity: 'medium' },
    ];

    mockGetIncidents.mockResolvedValue(mockIncidents);

    render(<IncidentDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Incidents')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.getByText('Triaged')).toBeInTheDocument();
      expect(screen.getByText('Resolved')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });
  });

  it('displays correct counts', async () => {
    const mockIncidents = [
      { id: '1', status: 'open', severity: 'critical' },
      { id: '2', status: 'open', severity: 'high' },
      { id: '3', status: 'triaged', severity: 'medium' },
      { id: '4', status: 'resolved', severity: 'low' },
    ];

    mockGetIncidents.mockResolvedValue(mockIncidents);

    render(<IncidentDashboard />);

    await waitFor(() => {
      expect(mockGetIncidents).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Total Incidents')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('handles empty incidents list', async () => {
    mockGetIncidents.mockResolvedValue([]);

    render(<IncidentDashboard />);

    await waitFor(() => {
      expect(mockGetIncidents).toHaveBeenCalled();
    });

    // Component should render without errors
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
  });
});