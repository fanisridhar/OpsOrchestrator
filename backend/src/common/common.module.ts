import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyService } from './policy.service';
import { Policy } from '../database/entities/policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Policy])],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class CommonModule {}
