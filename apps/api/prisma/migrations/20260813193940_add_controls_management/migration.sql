-- CreateEnum
CREATE TYPE "ControlType" AS ENUM ('PREVENTIVE', 'DETECTIVE', 'CORRECTIVE');

-- CreateEnum
CREATE TYPE "ControlAutomationType" AS ENUM ('MANUAL', 'AUTOMATED', 'HYBRID');

-- CreateEnum
CREATE TYPE "ControlFrequency" AS ENUM ('CONTINUOUS', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'AD_HOC');

-- CreateEnum
CREATE TYPE "ControlStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ControlExecutionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Control" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "type" "ControlType" NOT NULL,
    "automationType" "ControlAutomationType" NOT NULL,
    "frequency" "ControlFrequency" NOT NULL,
    "status" "ControlStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerMembershipId" UUID,
    "createdByMembershipId" UUID NOT NULL,
    "updatedByMembershipId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlExecution" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "controlId" UUID NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "ControlExecutionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "assignedToMembershipId" UUID,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedByMembershipId" UUID,
    "completionNotes" TEXT,
    "createdByMembershipId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskControl" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "riskId" UUID NOT NULL,
    "controlId" UUID NOT NULL,
    "createdByMembershipId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskControl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Control_organizationId_status_updatedAt_idx" ON "Control"("organizationId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "Control_organizationId_ownerMembershipId_idx" ON "Control"("organizationId", "ownerMembershipId");

-- CreateIndex
CREATE INDEX "Control_organizationId_category_idx" ON "Control"("organizationId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Control_organizationId_code_key" ON "Control"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Control_organizationId_id_key" ON "Control"("organizationId", "id");

-- CreateIndex
CREATE INDEX "ControlExecution_organizationId_controlId_dueAt_idx" ON "ControlExecution"("organizationId", "controlId", "dueAt");

-- CreateIndex
CREATE INDEX "ControlExecution_organizationId_status_dueAt_idx" ON "ControlExecution"("organizationId", "status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "ControlExecution_organizationId_id_key" ON "ControlExecution"("organizationId", "id");

-- CreateIndex
CREATE INDEX "RiskControl_organizationId_riskId_idx" ON "RiskControl"("organizationId", "riskId");

-- CreateIndex
CREATE INDEX "RiskControl_organizationId_controlId_idx" ON "RiskControl"("organizationId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskControl_organizationId_riskId_controlId_key" ON "RiskControl"("organizationId", "riskId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskControl_organizationId_id_key" ON "RiskControl"("organizationId", "id");

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_organizationId_ownerMembershipId_fkey" FOREIGN KEY ("organizationId", "ownerMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_organizationId_updatedByMembershipId_fkey" FOREIGN KEY ("organizationId", "updatedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlExecution" ADD CONSTRAINT "ControlExecution_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlExecution" ADD CONSTRAINT "ControlExecution_organizationId_controlId_fkey" FOREIGN KEY ("organizationId", "controlId") REFERENCES "Control"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlExecution" ADD CONSTRAINT "ControlExecution_organizationId_assignedToMembershipId_fkey" FOREIGN KEY ("organizationId", "assignedToMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlExecution" ADD CONSTRAINT "ControlExecution_organizationId_completedByMembershipId_fkey" FOREIGN KEY ("organizationId", "completedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlExecution" ADD CONSTRAINT "ControlExecution_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskControl" ADD CONSTRAINT "RiskControl_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskControl" ADD CONSTRAINT "RiskControl_organizationId_riskId_fkey" FOREIGN KEY ("organizationId", "riskId") REFERENCES "Risk"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskControl" ADD CONSTRAINT "RiskControl_organizationId_controlId_fkey" FOREIGN KEY ("organizationId", "controlId") REFERENCES "Control"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskControl" ADD CONSTRAINT "RiskControl_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
