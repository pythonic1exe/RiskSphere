-- CreateEnum
CREATE TYPE "OrganizationFrameworkStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrganizationRequirementStatus" AS ENUM ('NOT_ASSESSED', 'IN_PROGRESS', 'COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE');

-- DropIndex
DROP INDEX "FrameworkCatalog_code_key";

-- DropIndex
DROP INDEX "FrameworkCatalog_status_idx";

-- AlterTable
ALTER TABLE "FrameworkCatalog" ADD COLUMN "version" TEXT NOT NULL DEFAULT 'legacy';

-- CreateTable
CREATE TABLE "FrameworkRequirement" (
    "id" UUID NOT NULL,
    "frameworkCatalogId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "domain" TEXT,
    "parentRequirementId" UUID,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FrameworkRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationFramework" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "frameworkCatalogId" UUID NOT NULL,
    "status" "OrganizationFrameworkStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerMembershipId" UUID,
    "adoptedByMembershipId" UUID NOT NULL,
    "adoptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRequirement" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "organizationFrameworkId" UUID NOT NULL,
    "frameworkRequirementId" UUID NOT NULL,
    "status" "OrganizationRequirementStatus" NOT NULL DEFAULT 'NOT_ASSESSED',
    "ownerMembershipId" UUID,
    "notes" TEXT,
    "targetDate" TIMESTAMP(3),
    "applicabilityReason" TEXT,
    "lastAssessedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementAssessment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "organizationRequirementId" UUID NOT NULL,
    "status" "OrganizationRequirementStatus" NOT NULL,
    "rationale" TEXT NOT NULL,
    "assessedByMembershipId" UUID NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequirementAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementControl" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "organizationRequirementId" UUID NOT NULL,
    "controlId" UUID NOT NULL,
    "createdByMembershipId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequirementControl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FrameworkRequirement_frameworkCatalogId_sortOrder_idx" ON "FrameworkRequirement"("frameworkCatalogId", "sortOrder");
CREATE INDEX "FrameworkRequirement_frameworkCatalogId_parentRequirementId_idx" ON "FrameworkRequirement"("frameworkCatalogId", "parentRequirementId");
CREATE INDEX "FrameworkRequirement_frameworkCatalogId_domain_idx" ON "FrameworkRequirement"("frameworkCatalogId", "domain");
CREATE UNIQUE INDEX "FrameworkRequirement_frameworkCatalogId_id_key" ON "FrameworkRequirement"("frameworkCatalogId", "id");
CREATE UNIQUE INDEX "FrameworkRequirement_frameworkCatalogId_code_key" ON "FrameworkRequirement"("frameworkCatalogId", "code");
CREATE INDEX "OrganizationFramework_organizationId_status_updatedAt_idx" ON "OrganizationFramework"("organizationId", "status", "updatedAt");
CREATE INDEX "OrganizationFramework_organizationId_ownerMembershipId_idx" ON "OrganizationFramework"("organizationId", "ownerMembershipId");
CREATE UNIQUE INDEX "OrganizationFramework_organizationId_id_key" ON "OrganizationFramework"("organizationId", "id");
CREATE UNIQUE INDEX "OrganizationFramework_organizationId_frameworkCatalogId_key" ON "OrganizationFramework"("organizationId", "frameworkCatalogId");
CREATE INDEX "OrganizationRequirement_organizationId_status_updatedAt_idx" ON "OrganizationRequirement"("organizationId", "status", "updatedAt");
CREATE INDEX "OrganizationRequirement_organizationId_ownerMembershipId_idx" ON "OrganizationRequirement"("organizationId", "ownerMembershipId");
CREATE INDEX "OrganizationRequirement_org_framework_idx" ON "OrganizationRequirement"("organizationId", "organizationFrameworkId");
CREATE INDEX "OrgRequirement_frameworkReq_idx" ON "OrganizationRequirement"("organizationId", "frameworkRequirementId");
CREATE UNIQUE INDEX "OrganizationRequirement_organizationId_id_key" ON "OrganizationRequirement"("organizationId", "id");
CREATE UNIQUE INDEX "OrganizationRequirement_org_framework_req_key" ON "OrganizationRequirement"("organizationId", "organizationFrameworkId", "frameworkRequirementId");
CREATE INDEX "ReqAssessment_org_req_assessed_idx" ON "RequirementAssessment"("organizationId", "organizationRequirementId", "assessedAt");
CREATE INDEX "RequirementAssessment_organizationId_assessedByMembershipId_idx" ON "RequirementAssessment"("organizationId", "assessedByMembershipId");
CREATE INDEX "RequirementControl_organizationId_organizationRequirementId_idx" ON "RequirementControl"("organizationId", "organizationRequirementId");
CREATE INDEX "RequirementControl_organizationId_controlId_idx" ON "RequirementControl"("organizationId", "controlId");
CREATE UNIQUE INDEX "ReqControl_org_req_control_key" ON "RequirementControl"("organizationId", "organizationRequirementId", "controlId");
CREATE UNIQUE INDEX "RequirementControl_organizationId_id_key" ON "RequirementControl"("organizationId", "id");
CREATE INDEX "FrameworkCatalog_status_code_idx" ON "FrameworkCatalog"("status", "code");
CREATE UNIQUE INDEX "FrameworkCatalog_code_version_key" ON "FrameworkCatalog"("code", "version");

-- AddForeignKey
ALTER TABLE "FrameworkRequirement" ADD CONSTRAINT "FrameworkRequirement_frameworkCatalogId_fkey" FOREIGN KEY ("frameworkCatalogId") REFERENCES "FrameworkCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FrameworkRequirement" ADD CONSTRAINT "FrameworkRequirement_frameworkCatalogId_parentRequirementId_fkey" FOREIGN KEY ("frameworkCatalogId", "parentRequirementId") REFERENCES "FrameworkRequirement"("frameworkCatalogId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationFramework" ADD CONSTRAINT "OrganizationFramework_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationFramework" ADD CONSTRAINT "OrganizationFramework_frameworkCatalogId_fkey" FOREIGN KEY ("frameworkCatalogId") REFERENCES "FrameworkCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationFramework" ADD CONSTRAINT "OrganizationFramework_organizationId_ownerMembershipId_fkey" FOREIGN KEY ("organizationId", "ownerMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationFramework" ADD CONSTRAINT "OrganizationFramework_organizationId_adoptedByMembershipId_fkey" FOREIGN KEY ("organizationId", "adoptedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationRequirement" ADD CONSTRAINT "OrganizationRequirement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationRequirement" ADD CONSTRAINT "OrganizationRequirement_organizationId_organizationFrameworkId_fkey" FOREIGN KEY ("organizationId", "organizationFrameworkId") REFERENCES "OrganizationFramework"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationRequirement" ADD CONSTRAINT "OrganizationRequirement_frameworkRequirementId_fkey" FOREIGN KEY ("frameworkRequirementId") REFERENCES "FrameworkRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationRequirement" ADD CONSTRAINT "OrganizationRequirement_organizationId_ownerMembershipId_fkey" FOREIGN KEY ("organizationId", "ownerMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RequirementAssessment" ADD CONSTRAINT "RequirementAssessment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequirementAssessment" ADD CONSTRAINT "RequirementAssessment_organizationId_organizationRequirementId_fkey" FOREIGN KEY ("organizationId", "organizationRequirementId") REFERENCES "OrganizationRequirement"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequirementAssessment" ADD CONSTRAINT "RequirementAssessment_organizationId_assessedByMembershipId_fkey" FOREIGN KEY ("organizationId", "assessedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RequirementControl" ADD CONSTRAINT "RequirementControl_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequirementControl" ADD CONSTRAINT "RequirementControl_organizationId_organizationRequirementId_fkey" FOREIGN KEY ("organizationId", "organizationRequirementId") REFERENCES "OrganizationRequirement"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequirementControl" ADD CONSTRAINT "RequirementControl_organizationId_controlId_fkey" FOREIGN KEY ("organizationId", "controlId") REFERENCES "Control"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequirementControl" ADD CONSTRAINT "RequirementControl_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
