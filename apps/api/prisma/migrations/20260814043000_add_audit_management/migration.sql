-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('INTERNAL', 'EXTERNAL', 'COMPLIANCE', 'OPERATIONAL', 'VENDOR');
CREATE TYPE "AuditStatus" AS ENUM ('DRAFT', 'PLANNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'CANCELLED');
CREATE TYPE "AuditMemberRole" AS ENUM ('LEAD_AUDITOR', 'AUDITOR', 'REVIEWER', 'OBSERVER');
CREATE TYPE "AuditScopeType" AS ENUM ('FRAMEWORK', 'REQUIREMENT', 'CONTROL');
CREATE TYPE "AuditTestStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'COMPLETED', 'BLOCKED');
CREATE TYPE "AuditTestResult" AS ENUM ('PASS', 'FAIL', 'EXCEPTION', 'NOT_APPLICABLE');

CREATE TABLE "Audit" (
  "id" UUID NOT NULL, "organizationId" UUID NOT NULL, "code" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "type" "AuditType" NOT NULL, "status" "AuditStatus" NOT NULL DEFAULT 'DRAFT', "leadAuditorMembershipId" UUID,
  "createdByMembershipId" UUID NOT NULL, "updatedByMembershipId" UUID NOT NULL, "plannedStartAt" TIMESTAMP(3), "plannedEndAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditMember" (
  "id" UUID NOT NULL, "organizationId" UUID NOT NULL, "auditId" UUID NOT NULL, "membershipId" UUID NOT NULL, "role" "AuditMemberRole" NOT NULL,
  "addedByMembershipId" UUID NOT NULL, "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditMember_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditScope" (
  "id" UUID NOT NULL, "organizationId" UUID NOT NULL, "auditId" UUID NOT NULL, "type" "AuditScopeType" NOT NULL,
  "organizationFrameworkId" UUID, "organizationRequirementId" UUID, "controlId" UUID, "addedByMembershipId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditScope_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditTest" (
  "id" UUID NOT NULL, "organizationId" UUID NOT NULL, "auditId" UUID NOT NULL, "code" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "controlId" UUID, "organizationRequirementId" UUID, "procedure" TEXT NOT NULL, "expectedResult" TEXT NOT NULL,
  "status" "AuditTestStatus" NOT NULL DEFAULT 'NOT_STARTED', "result" "AuditTestResult", "assignedToMembershipId" UUID,
  "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "notes" TEXT, "createdByMembershipId" UUID NOT NULL, "updatedByMembershipId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "AuditTest_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditTestEvidence" (
  "id" UUID NOT NULL, "organizationId" UUID NOT NULL, "auditTestId" UUID NOT NULL, "evidenceId" UUID NOT NULL, "evidenceVersionId" UUID NOT NULL,
  "linkedByMembershipId" UUID NOT NULL, "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditTestEvidence_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditTestObservation" (
  "id" UUID NOT NULL, "organizationId" UUID NOT NULL, "auditTestId" UUID NOT NULL, "content" TEXT NOT NULL,
  "createdByMembershipId" UUID NOT NULL, "updatedByMembershipId" UUID NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "AuditTestObservation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Audit_organizationId_code_key" ON "Audit"("organizationId", "code");
CREATE UNIQUE INDEX "Audit_organizationId_id_key" ON "Audit"("organizationId", "id");
CREATE INDEX "Audit_organizationId_status_updatedAt_idx" ON "Audit"("organizationId", "status", "updatedAt");
CREATE INDEX "Audit_organizationId_type_updatedAt_idx" ON "Audit"("organizationId", "type", "updatedAt");
CREATE INDEX "Audit_organizationId_leadAuditorMembershipId_idx" ON "Audit"("organizationId", "leadAuditorMembershipId");
CREATE INDEX "Audit_organizationId_plannedStartAt_plannedEndAt_idx" ON "Audit"("organizationId", "plannedStartAt", "plannedEndAt");
CREATE UNIQUE INDEX "AuditMember_organizationId_auditId_membershipId_key" ON "AuditMember"("organizationId", "auditId", "membershipId");
CREATE UNIQUE INDEX "AuditMember_organizationId_id_key" ON "AuditMember"("organizationId", "id");
CREATE INDEX "AuditMember_organizationId_auditId_role_idx" ON "AuditMember"("organizationId", "auditId", "role");
CREATE INDEX "AuditMember_organizationId_membershipId_idx" ON "AuditMember"("organizationId", "membershipId");
CREATE UNIQUE INDEX "AuditScope_organizationId_id_key" ON "AuditScope"("organizationId", "id");
CREATE UNIQUE INDEX "AuditScope_organizationId_auditId_organizationFrameworkId_key" ON "AuditScope"("organizationId", "auditId", "organizationFrameworkId");
CREATE UNIQUE INDEX "AuditScope_organizationId_auditId_organizationRequirementId_key" ON "AuditScope"("organizationId", "auditId", "organizationRequirementId");
CREATE UNIQUE INDEX "AuditScope_organizationId_auditId_controlId_key" ON "AuditScope"("organizationId", "auditId", "controlId");
CREATE INDEX "AuditScope_organizationId_auditId_type_idx" ON "AuditScope"("organizationId", "auditId", "type");
CREATE INDEX "AuditScope_organizationId_organizationFrameworkId_idx" ON "AuditScope"("organizationId", "organizationFrameworkId");
CREATE INDEX "AuditScope_organizationId_organizationRequirementId_idx" ON "AuditScope"("organizationId", "organizationRequirementId");
CREATE INDEX "AuditScope_organizationId_controlId_idx" ON "AuditScope"("organizationId", "controlId");
CREATE UNIQUE INDEX "AuditTest_organizationId_auditId_code_key" ON "AuditTest"("organizationId", "auditId", "code");
CREATE UNIQUE INDEX "AuditTest_organizationId_id_key" ON "AuditTest"("organizationId", "id");
CREATE INDEX "AuditTest_organizationId_auditId_status_updatedAt_idx" ON "AuditTest"("organizationId", "auditId", "status", "updatedAt");
CREATE INDEX "AuditTest_organizationId_result_idx" ON "AuditTest"("organizationId", "result");
CREATE INDEX "AuditTest_organizationId_assignedToMembershipId_idx" ON "AuditTest"("organizationId", "assignedToMembershipId");
CREATE INDEX "AuditTest_organizationId_controlId_idx" ON "AuditTest"("organizationId", "controlId");
CREATE INDEX "AuditTest_organizationId_organizationRequirementId_idx" ON "AuditTest"("organizationId", "organizationRequirementId");
CREATE UNIQUE INDEX "AuditTestEvidence_organizationId_id_key" ON "AuditTestEvidence"("organizationId", "id");
CREATE UNIQUE INDEX "AuditTestEvidence_organizationId_auditTestId_evidenceVersionId_key" ON "AuditTestEvidence"("organizationId", "auditTestId", "evidenceVersionId");
CREATE INDEX "AuditTestEvidence_organizationId_auditTestId_linkedAt_idx" ON "AuditTestEvidence"("organizationId", "auditTestId", "linkedAt");
CREATE INDEX "AuditTestEvidence_organizationId_evidenceId_idx" ON "AuditTestEvidence"("organizationId", "evidenceId");
CREATE INDEX "AuditTestEvidence_organizationId_evidenceVersionId_idx" ON "AuditTestEvidence"("organizationId", "evidenceVersionId");
CREATE UNIQUE INDEX "AuditTestObservation_organizationId_id_key" ON "AuditTestObservation"("organizationId", "id");
CREATE INDEX "AuditTestObservation_organizationId_auditTestId_createdAt_idx" ON "AuditTestObservation"("organizationId", "auditTestId", "createdAt");

ALTER TABLE "Audit" ADD CONSTRAINT "Audit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_organizationId_leadAuditorMembershipId_fkey" FOREIGN KEY ("organizationId", "leadAuditorMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_organizationId_updatedByMembershipId_fkey" FOREIGN KEY ("organizationId", "updatedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditMember" ADD CONSTRAINT "AuditMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditMember" ADD CONSTRAINT "AuditMember_organizationId_auditId_fkey" FOREIGN KEY ("organizationId", "auditId") REFERENCES "Audit"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditMember" ADD CONSTRAINT "AuditMember_organizationId_membershipId_fkey" FOREIGN KEY ("organizationId", "membershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditMember" ADD CONSTRAINT "AuditMember_organizationId_addedByMembershipId_fkey" FOREIGN KEY ("organizationId", "addedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditScope" ADD CONSTRAINT "AuditScope_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditScope" ADD CONSTRAINT "AuditScope_organizationId_auditId_fkey" FOREIGN KEY ("organizationId", "auditId") REFERENCES "Audit"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditScope" ADD CONSTRAINT "AuditScope_organizationId_organizationFrameworkId_fkey" FOREIGN KEY ("organizationId", "organizationFrameworkId") REFERENCES "OrganizationFramework"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditScope" ADD CONSTRAINT "AuditScope_organizationId_organizationRequirementId_fkey" FOREIGN KEY ("organizationId", "organizationRequirementId") REFERENCES "OrganizationRequirement"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditScope" ADD CONSTRAINT "AuditScope_organizationId_controlId_fkey" FOREIGN KEY ("organizationId", "controlId") REFERENCES "Control"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditScope" ADD CONSTRAINT "AuditScope_organizationId_addedByMembershipId_fkey" FOREIGN KEY ("organizationId", "addedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTest" ADD CONSTRAINT "AuditTest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditTest" ADD CONSTRAINT "AuditTest_organizationId_auditId_fkey" FOREIGN KEY ("organizationId", "auditId") REFERENCES "Audit"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditTest" ADD CONSTRAINT "AuditTest_organizationId_controlId_fkey" FOREIGN KEY ("organizationId", "controlId") REFERENCES "Control"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTest" ADD CONSTRAINT "AuditTest_organizationId_organizationRequirementId_fkey" FOREIGN KEY ("organizationId", "organizationRequirementId") REFERENCES "OrganizationRequirement"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTest" ADD CONSTRAINT "AuditTest_organizationId_assignedToMembershipId_fkey" FOREIGN KEY ("organizationId", "assignedToMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTest" ADD CONSTRAINT "AuditTest_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTest" ADD CONSTRAINT "AuditTest_organizationId_updatedByMembershipId_fkey" FOREIGN KEY ("organizationId", "updatedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTestEvidence" ADD CONSTRAINT "AuditTestEvidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditTestEvidence" ADD CONSTRAINT "AuditTestEvidence_organizationId_auditTestId_fkey" FOREIGN KEY ("organizationId", "auditTestId") REFERENCES "AuditTest"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditTestEvidence" ADD CONSTRAINT "AuditTestEvidence_organizationId_evidenceId_fkey" FOREIGN KEY ("organizationId", "evidenceId") REFERENCES "Evidence"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditTestEvidence" ADD CONSTRAINT "AuditTestEvidence_organizationId_evidenceVersionId_fkey" FOREIGN KEY ("organizationId", "evidenceVersionId") REFERENCES "EvidenceVersion"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTestEvidence" ADD CONSTRAINT "AuditTestEvidence_organizationId_linkedByMembershipId_fkey" FOREIGN KEY ("organizationId", "linkedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTestObservation" ADD CONSTRAINT "AuditTestObservation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditTestObservation" ADD CONSTRAINT "AuditTestObservation_organizationId_auditTestId_fkey" FOREIGN KEY ("organizationId", "auditTestId") REFERENCES "AuditTest"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditTestObservation" ADD CONSTRAINT "AuditTestObservation_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditTestObservation" ADD CONSTRAINT "AuditTestObservation_organizationId_updatedByMembershipId_fkey" FOREIGN KEY ("organizationId", "updatedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
