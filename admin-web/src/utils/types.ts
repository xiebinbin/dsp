// types.ts
export type RuleRole = 'Root' | 'Operator' | 'Agent' | 'Advertiser';

export interface UserPermissions {
  [RuleRole: string]: string[];
}
