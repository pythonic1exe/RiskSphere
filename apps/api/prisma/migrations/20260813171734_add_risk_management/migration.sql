-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RiskAssessmentType" AS ENUM ('INHERENT', 'RESIDUAL');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskTreatmentStrategy" AS ENUM ('MITIGATE', 'ACCEPT', 'AVOID', 'TRANSFER');

-- CreateEnum
CREATE TYPE "RiskTreatmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Risk" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" "RiskStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerMembershipId" UUID,
    "nextReviewAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "createdByMembershipId" UUID NOT NULL,
    "updatedByMembershipId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "riskId" UUID NOT NULL,
    "type" "RiskAssessmentType" NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "severity" "RiskSeverity" NOT NULL,
    "rationale" TEXT,
    "assessedByMembershipId" UUID NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskTreatment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "riskId" UUID NOT NULL,
    "strategy" "RiskTreatmentStrategy" NOT NULL,
    "status" "RiskTreatmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "plan" TEXT,
    "targetDate" TIMESTAMP(3),
    "ownerMembershipId" UUID,
    "acceptedByMembershipId" UUID,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Risk_organizationId_status_updatedAt_idx" ON "Risk"("organizationId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "Risk_organizationId_ownerMembershipId_idx" ON "Risk"("organizationId", "ownerMembershipId");

-- CreateIndex
CREATE INDEX "Risk_organizationId_category_idx" ON "Risk"("organizationId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Risk_organizationId_code_key" ON "Risk"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Risk_organizationId_id_key" ON "Risk"("organizationId", "id");

-- CreateIndex
CREATE INDEX "RiskAssessment_organizationId_riskId_type_assessedAt_idx" ON "RiskAssessment"("organizationId", "riskId", "type", "assessedAt");

-- CreateIndex
CREATE INDEX "RiskAssessment_organizationId_assessedByMembershipId_idx" ON "RiskAssessment"("organizationId", "assessedByMembershipId");

-- CreateIndex
CREATE INDEX "RiskTreatment_organizationId_status_targetDate_idx" ON "RiskTreatment"("organizationId", "status", "targetDate");

-- CreateIndex
CREATE INDEX "RiskTreatment_organizationId_ownerMembershipId_idx" ON "RiskTreatment"("organizationId", "ownerMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskTreatment_organizationId_riskId_key" ON "RiskTreatment"("organizationId", "riskId");

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_organizationId_ownerMembershipId_fkey" FOREIGN KEY ("organizationId", "ownerMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_organizationId_updatedByMembershipId_fkey" FOREIGN KEY ("organizationId", "updatedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_organizationId_riskId_fkey" FOREIGN KEY ("organizationId", "riskId") REFERENCES "Risk"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_organizationId_assessedByMembershipId_fkey" FOREIGN KEY ("organizationId", "assessedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskTreatment" ADD CONSTRAINT "RiskTreatment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskTreatment" ADD CONSTRAINT "RiskTreatment_organizationId_riskId_fkey" FOREIGN KEY ("organizationId", "riskId") REFERENCES "Risk"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskTreatment" ADD CONSTRAINT "RiskTreatment_organizationId_ownerMembershipId_fkey" FOREIGN KEY ("organizationId", "ownerMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskTreatment" ADD CONSTRAINT "RiskTreatment_organizationId_acceptedByMembershipId_fkey" FOREIGN KEY ("organizationId", "acceptedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
