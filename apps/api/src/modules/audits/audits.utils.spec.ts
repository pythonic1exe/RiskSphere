import { describe, expect, it } from 'vitest';

import { canTransitionAudit, canTransitionAuditTest, hasMeaningfulAuditScope, validateAuditScopeTarget } from './audits.utils';

describe('Audit invariants', () => {
  it('allows only the explicit Audit lifecycle transitions', () => {
    expect(canTransitionAudit('DRAFT', 'PLANNED')).toBe(true);
    expect(canTransitionAudit('PLANNED', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionAudit('IN_PROGRESS', 'UNDER_REVIEW')).toBe(true);
    expect(canTransitionAudit('UNDER_REVIEW', 'COMPLETED')).toBe(true);
    expect(canTransitionAudit('COMPLETED', 'IN_PROGRESS')).toBe(false);
    expect(canTransitionAudit('CANCELLED', 'PLANNED')).toBe(false);
  });

  it('allows cancellation only before completion', () => {
    expect(canTransitionAudit('DRAFT', 'CANCELLED')).toBe(true);
    expect(canTransitionAudit('IN_PROGRESS', 'CANCELLED')).toBe(true);
    expect(canTransitionAudit('COMPLETED', 'CANCELLED')).toBe(false);
  });

  it('requires a target for each scope type', () => {
    expect(validateAuditScopeTarget('FRAMEWORK', { organizationFrameworkId: 'f' })).toBe(true);
    expect(validateAuditScopeTarget('REQUIREMENT', { organizationRequirementId: 'r' })).toBe(true);
    expect(validateAuditScopeTarget('CONTROL', { controlId: 'c' })).toBe(true);
    expect(validateAuditScopeTarget('CONTROL', { organizationRequirementId: 'r' })).toBe(false);
  });

  it('recognizes meaningful scope and supported test transitions', () => {
    expect(hasMeaningfulAuditScope(1)).toBe(true);
    expect(hasMeaningfulAuditScope(0)).toBe(false);
    expect(canTransitionAuditTest('NOT_STARTED', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionAuditTest('IN_PROGRESS', 'READY_FOR_REVIEW')).toBe(true);
    expect(canTransitionAuditTest('READY_FOR_REVIEW', 'COMPLETED')).toBe(true);
    expect(canTransitionAuditTest('COMPLETED', 'IN_PROGRESS')).toBe(false);
  });
});
