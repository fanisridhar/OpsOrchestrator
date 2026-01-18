import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy, PolicyType } from '../database/entities/policy.entity';
import { Action, ActionType } from '../database/entities/action.entity';
import { UserRole } from '../database/entities/user.entity';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
  ) {}

  async canApproveAction(action: Action, userRole: UserRole): Promise<boolean> {
    // Get active policies
    const policies = await this.policyRepository.find({
      where: { isActive: true },
    });

    // Check role requirements
    const rolePolicy = policies.find((p) => p.type === PolicyType.ROLE_REQUIREMENT);
    if (rolePolicy && rolePolicy.rules.requiredRoles) {
      if (!rolePolicy.rules.requiredRoles.includes(userRole)) {
        // Special actions require senior role
        if (action.type === ActionType.ROLLBACK || action.type === ActionType.REVERT_DEPLOY) {
          if (userRole !== UserRole.SENIOR_ON_CALL && userRole !== UserRole.ADMIN) {
            return false;
          }
        }
      }
    }

    // Check action whitelist
    const whitelistPolicy = policies.find((p) => p.type === PolicyType.ACTION_WHITELIST);
    if (whitelistPolicy && whitelistPolicy.rules.allowedActions) {
      if (!whitelistPolicy.rules.allowedActions.includes(action.type)) {
        return false;
      }
    }

    return true;
  }

  async requiresDryRun(actionType: ActionType): Promise<boolean> {
    const policies = await this.policyRepository.find({
      where: { isActive: true, type: PolicyType.DRY_RUN_REQUIRED },
    });

    if (policies.length > 0 && policies[0].rules.requiredActions) {
      return policies[0].rules.requiredActions.includes(actionType);
    }

    // Default: require dry-run for destructive actions
    return [ActionType.ROLLBACK, ActionType.REVERT_DEPLOY].includes(actionType);
  }
}
