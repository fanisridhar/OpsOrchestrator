import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalController {
  constructor(private approvalService: ApprovalService) {}

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Request() req,
  ) {
    return this.approvalService.approve(
      id,
      req.user.id,
      req.user.role,
      body.comment,
    );
  }

  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Request() req,
  ) {
    return this.approvalService.reject(id, req.user.id, body.comment);
  }
}
