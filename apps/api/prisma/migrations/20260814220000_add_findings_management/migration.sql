CREATE TYPE "FindingSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "FindingStatus" AS ENUM ('OPEN', 'IN_REMEDIATION', 'READY_FOR_VALIDATION', 'CLOSED');
CREATE TYPE "FindingSourceType" AS ENUM ('AUDIT_OBSERVATION', 'MANUAL');
CREATE TYPE "FindingEvidencePurpose" AS ENUM ('REMEDIATION', 'VALIDATION');
CREATE TYPE "FindingValidationDecision" AS ENUM ('ACCEPTED', 'REJECTED');
CREATE TYPE "FindingResolutionType" AS ENUM ('REMEDIATED', 'RISK_ACCEPTED', 'FALSE_POSITIVE', 'DUPLICATE', 'OTHER');
CREATE TYPE "FindingActivityType" AS ENUM ('CREATED', 'PROMOTED_FROM_OBSERVATION', 'UPDATED', 'OWNER_CHANGED', 'SEVERITY_CHANGED', 'REMEDIATION_STARTED', 'REMEDIATION_UPDATED', 'EVIDENCE_LINKED', 'EVIDENCE_UNLINKED', 'SUBMITTED_FOR_VALIDATION', 'VALIDATION_ACCEPTED', 'VALIDATION_REJECTED', 'CLOSED', 'REOPENED');

CREATE TABLE "Finding" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "findingNumber" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" "FindingSeverity" NOT NULL,
  "status" "FindingStatus" NOT NULL DEFAULT 'OPEN',
  "sourceType" "FindingSourceType" NOT NULL,
  "sourceObservationId" UUID,
  "ownerMembershipId" UUID,
  "rootCause" TEXT,
  "impact" TEXT,
  "recommendation" TEXT,
  "remediationPlan" TEXT,
  "dueDate" TIMESTAMP(3),
  "resolutionType" "FindingResolutionType",
  "resolutionRationale" TEXT,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedForValidationAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdByMembershipId" UUID NOT NULL,
  "updatedByMembershipId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FindingSequence" (
  "organizationId" UUID NOT NULL,
  "year" INTEGER NOT NULL,
  "nextNumber" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "FindingSequence_pkey" PRIMARY KEY ("organizationId", "year")
);

CREATE TABLE "FindingEvidence" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "findingId" UUID NOT NULL,
  "evidenceVersionId" UUID NOT NULL,
  "purpose" "FindingEvidencePurpose" NOT NULL,
  "linkedByMembershipId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FindingEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FindingValidation" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "findingId" UUID NOT NULL,
  "reviewerMembershipId" UUID NOT NULL,
  "decision" "FindingValidationDecision" NOT NULL,
  "notes" TEXT,
  "resolutionType" "FindingResolutionType",
  "resolutionRationale" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FindingValidation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FindingActivity" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "findingId" UUID NOT NULL,
  "actorMembershipId" UUID NOT NULL,
  "type" "FindingActivityType" NOT NULL,
  "fromStatus" "FindingStatus",
  "toStatus" "FindingStatus",
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FindingActivity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Finding_organizationId_findingNumber_key" ON "Finding"("organizationId", "findingNumber");
CREATE UNIQUE INDEX "Finding_organizationId_sourceObservationId_key" ON "Finding"("organizationId", "sourceObservationId");
CREATE UNIQUE INDEX "Finding_organizationId_id_key" ON "Finding"("organizationId", "id");
CREATE INDEX "Finding_organizationId_status_updatedAt_idx" ON "Finding"("organizationId", "status", "updatedAt");
CREATE INDEX "Finding_organizationId_severity_updatedAt_idx" ON "Finding"("organizationId", "severity", "updatedAt");
CREATE INDEX "Finding_organizationId_ownerMembershipId_idx" ON "Finding"("organizationId", "ownerMembershipId");
CREATE INDEX "Finding_organizationId_dueDate_idx" ON "Finding"("organizationId", "dueDate");
CREATE INDEX "Finding_organizationId_sourceType_idx" ON "Finding"("organizationId", "sourceType");
CREATE INDEX "Finding_organizationId_createdAt_idx" ON "Finding"("organizationId", "createdAt");
CREATE UNIQUE INDEX "FindingEvidence_organizationId_id_key" ON "FindingEvidence"("organizationId", "id");
CREATE UNIQUE INDEX "FindingEvidence_organizationId_findingId_evidenceVersionId_key" ON "FindingEvidence"("organizationId", "findingId", "evidenceVersionId");
CREATE INDEX "FindingEvidence_organizationId_findingId_createdAt_idx" ON "FindingEvidence"("organizationId", "findingId", "createdAt");
CREATE INDEX "FindingEvidence_organizationId_evidenceVersionId_idx" ON "FindingEvidence"("organizationId", "evidenceVersionId");
CREATE UNIQUE INDEX "FindingValidation_organizationId_id_key" ON "FindingValidation"("organizationId", "id");
CREATE INDEX "FindingValidation_organizationId_findingId_createdAt_idx" ON "FindingValidation"("organizationId", "findingId", "createdAt");
CREATE INDEX "FindingValidation_organizationId_reviewerMembershipId_idx" ON "FindingValidation"("organizationId", "reviewerMembershipId");
CREATE UNIQUE INDEX "FindingActivity_organizationId_id_key" ON "FindingActivity"("organizationId", "id");
CREATE INDEX "FindingActivity_organizationId_findingId_createdAt_idx" ON "FindingActivity"("organizationId", "findingId", "createdAt");
CREATE INDEX "FindingActivity_organizationId_actorMembershipId_idx" ON "FindingActivity"("organizationId", "actorMembershipId");

ALTER TABLE "Finding" ADD CONSTRAINT "Finding_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_organizationId_sourceObservationId_fkey" FOREIGN KEY ("organizationId", "sourceObservationId") REFERENCES "AuditTestObservation"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_organizationId_ownerMembershipId_fkey" FOREIGN KEY ("organizationId", "ownerMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_organizationId_updatedByMembershipId_fkey" FOREIGN KEY ("organizationId", "updatedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FindingSequence" ADD CONSTRAINT "FindingSequence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FindingEvidence" ADD CONSTRAINT "FindingEvidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FindingEvidence" ADD CONSTRAINT "FindingEvidence_organizationId_findingId_fkey" FOREIGN KEY ("organizationId", "findingId") REFERENCES "Finding"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FindingEvidence" ADD CONSTRAINT "FindingEvidence_organizationId_evidenceVersionId_fkey" FOREIGN KEY ("organizationId", "evidenceVersionId") REFERENCES "EvidenceVersion"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FindingEvidence" ADD CONSTRAINT "FindingEvidence_organizationId_linkedByMembershipId_fkey" FOREIGN KEY ("organizationId", "linkedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FindingValidation" ADD CONSTRAINT "FindingValidation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FindingValidation" ADD CONSTRAINT "FindingValidation_organizationId_findingId_fkey" FOREIGN KEY ("organizationId", "findingId") REFERENCES "Finding"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FindingValidation" ADD CONSTRAINT "FindingValidation_organizationId_reviewerMembershipId_fkey" FOREIGN KEY ("organizationId", "reviewerMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FindingActivity" ADD CONSTRAINT "FindingActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FindingActivity" ADD CONSTRAINT "FindingActivity_organizationId_findingId_fkey" FOREIGN KEY ("organizationId", "findingId") REFERENCES "Finding"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FindingActivity" ADD CONSTRAINT "FindingActivity_organizationId_actorMembershipId_fkey" FOREIGN KEY ("organizationId", "actorMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
