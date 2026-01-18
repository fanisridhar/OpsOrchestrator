# OpsOrchestrator

A multi-agent platform that automates operational workflows (deployments, rollbacks, incident response, runbook execution, and monitoring remediation) by coordinating specialist agents with human approvals and safe guardrails.

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Frontend │─────▶│   Backend     │─────▶│  PostgreSQL │
│  (Next.js)│◀─────│  (NestJS)     │◀─────│   (State)   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├────▶ Redis/BullMQ (Queue)
                            ├────▶ WebSocket (Real-time)
                            ├────▶ Vault (Secrets)
                            └────▶ Agents (Monitor, Triage, Executor)
```

## 🎯 Core Features

- **Multi-Agent Orchestration**: Controller coordinates specialist agents (Monitor, Triage, Executor, Investigator)
- **Real-time Incident Dashboard**: WebSocket-powered live updates
- **Intelligent Triage**: AI-powered incident classification and runbook suggestions
- **Safe Remediation**: Kubernetes actions with approval workflows
- **Audit Trail**: Complete action history with immutable logs
- **RBAC**: Role-based access control for approvals and actions
- **Monitoring Integration**: Prometheus, Datadog, Sentry webhook support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fanisridhar/OpsOrchestrator.git
cd OpsOrchestrator
```

2. Install dependencies:
```bash
npm run install:all
```

3. Start infrastructure services:
```bash
docker-compose up -d
```

4. Set up backend environment:
```bash
cd backend
cp .env.example .env  # Edit .env with your configuration
```

5. Set up frontend environment:
```bash
cd ../frontend
cp .env.example .env.local  # Edit .env.local with your configuration
```

6. Start backend development server:
```bash
cd ../backend
npm run start:dev
```

7. Start frontend development server (in a new terminal):
```bash
cd frontend
npm run dev
```

Backend will be available at `http://localhost:3000`
Frontend will be available at `http://localhost:3001`

## 📁 Project Structure

```
OpsOrchestrator/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── agents/         # Agent implementations (Controller, Monitor, Triage, Executor, Investigator)
│   │   ├── incidents/      # Incident management
│   │   ├── actions/        # Action execution
│   │   ├── approvals/      # Approval workflows
│   │   ├── connectors/     # External integrations (Kubernetes, etc.)
│   │   ├── audit/          # Audit logging
│   │   ├── websocket/      # Real-time updates
│   │   ├── monitoring/     # Monitoring webhooks
│   │   ├── database/       # TypeORM entities
│   │   ├── auth/           # Authentication & authorization
│   │   └── users/          # User management
│   └── ...
├── frontend/               # Next.js frontend application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── context/           # React contexts (Auth, WebSocket)
│   ├── lib/               # API utilities
│   └── ...
└── docker-compose.yml     # Local infrastructure
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://opsuser:opspass@localhost:5432/ops_orchestrator
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=opsuser
DATABASE_PASSWORD=opspass
DATABASE_NAME=ops_orchestrator

REDIS_HOST=localhost
REDIS_PORT=6379

VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development

FRONTEND_URL=http://localhost:3001
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

## 🔌 Monitoring Integration

### Prometheus Alertmanager

Configure Alertmanager to send webhooks to:
```
POST http://localhost:3000/monitoring/webhooks/prometheus
```

### Datadog

Configure Datadog webhooks to:
```
POST http://localhost:3000/monitoring/webhooks/datadog
```

### Sentry

Configure Sentry webhooks to:
```
POST http://localhost:3000/monitoring/webhooks/sentry
```

## 📚 API Documentation

The API follows RESTful conventions. Main endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /incidents` - List all incidents
- `GET /incidents/:id` - Get incident details
- `POST /incidents` - Create incident
- `PUT /incidents/:id/status` - Update incident status
- `POST /actions` - Create action
- `POST /approvals/:id/approve` - Approve action
- `POST /approvals/:id/reject` - Reject action
- `GET /audit` - Get audit logs

WebSocket events:
- `incident:update` - Incident updated
- `action:update` - Action updated
- `approval:update` - Approval updated

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with NestJS, Next.js, TypeScript, PostgreSQL, Redis, and Socket.io