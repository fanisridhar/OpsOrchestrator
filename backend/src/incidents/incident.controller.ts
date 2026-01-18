import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IncidentService } from './incident.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Incident, IncidentStatus } from '../database/entities/incident.entity';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentController {
  constructor(private incidentService: IncidentService) {}

  @Post()
  async create(@Body() data: Partial<Incident>) {
    return this.incidentService.create(data);
  }

  @Get()
  async findAll() {
    return this.incidentService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.incidentService.findById(id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: IncidentStatus },
  ) {
    return this.incidentService.updateStatus(id, body.status);
  }
}
