import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ActionService } from './action.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Action, ActionType, ActionStatus } from '../database/entities/action.entity';

@Controller('actions')
@UseGuards(JwtAuthGuard)
export class ActionController {
  constructor(private actionService: ActionService) {}

  @Post()
  async create(@Body() data: Partial<Action>, @Request() req) {
    return this.actionService.create({
      ...data,
      status: ActionStatus.PENDING,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.actionService.findById(id);
  }

  @Get('incident/:incidentId')
  async findByIncidentId(@Param('incidentId') incidentId: string) {
    return this.actionService.findByIncidentId(incidentId);
  }
}
