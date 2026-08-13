-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('FILE', 'URL', 'TEXT', 'SYSTEM_RECORD');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Evidence" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "EvidenceType" NOT NULL,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerMembershipId" UUID,
    "createdByMembershipId" UUID NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceVersion" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "evidenceId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "fileName" TEXT,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "checksum" TEXT,
    "externalUrl" TEXT,
    "textContent" TEXT,
    "uploadedByMembershipId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlEvidence" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "evidenceId" UUID NOT NULL,
    "controlId" UUID NOT NULL,
    "linkedByMembershipId" UUID NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionEvidence" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "evidenceId" UUID NOT NULL,
    "controlExecutionId" UUID NOT NULL,
    "linkedByMembershipId" UUID NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evidence_organizationId_status_updatedAt_idx" ON "Evidence"("organizationId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_type_updatedAt_idx" ON "Evidence"("organizationId", "type", "updatedAt");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_ownerMembershipId_idx" ON "Evidence"("organizationId", "ownerMembershipId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_createdByMembershipId_idx" ON "Evidence"("organizationId", "createdByMembershipId");

-- CreateIndex
CREATE INDEX "Evidence_organizationId_expiresAt_idx" ON "Evidence"("organizationId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_organizationId_id_key" ON "Evidence"("organizationId", "id");

-- CreateIndex
CREATE INDEX "EvidenceVersion_organizationId_evidenceId_createdAt_idx" ON "EvidenceVersion"("organizationId", "evidenceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceVersion_organizationId_evidenceId_versionNumber_key" ON "EvidenceVersion"("organizationId", "evidenceId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceVersion_organizationId_id_key" ON "EvidenceVersion"("organizationId", "id");

-- CreateIndex
CREATE INDEX "ControlEvidence_organizationId_evidenceId_idx" ON "ControlEvidence"("organizationId", "evidenceId");

-- CreateIndex
CREATE INDEX "ControlEvidence_organizationId_controlId_idx" ON "ControlEvidence"("organizationId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "ControlEvidence_organizationId_evidenceId_controlId_key" ON "ControlEvidence"("organizationId", "evidenceId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "ControlEvidence_organizationId_id_key" ON "ControlEvidence"("organizationId", "id");

-- CreateIndex
CREATE INDEX "ExecutionEvidence_organizationId_evidenceId_idx" ON "ExecutionEvidence"("organizationId", "evidenceId");

-- CreateIndex
CREATE INDEX "ExecutionEvidence_organizationId_controlExecutionId_idx" ON "ExecutionEvidence"("organizationId", "controlExecutionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionEvidence_organizationId_evidenceId_controlExecutio_key" ON "ExecutionEvidence"("organizationId", "evidenceId", "controlExecutionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionEvidence_organizationId_id_key" ON "ExecutionEvidence"("organizationId", "id");

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_organizationId_ownerMembershipId_fkey" FOREIGN KEY ("organizationId", "ownerMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_organizationId_evidenceId_fkey" FOREIGN KEY ("organizationId", "evidenceId") REFERENCES "Evidence"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceVersion" ADD CONSTRAINT "EvidenceVersion_organizationId_uploadedByMembershipId_fkey" FOREIGN KEY ("organizationId", "uploadedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlEvidence" ADD CONSTRAINT "ControlEvidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlEvidence" ADD CONSTRAINT "ControlEvidence_organizationId_evidenceId_fkey" FOREIGN KEY ("organizationId", "evidenceId") REFERENCES "Evidence"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlEvidence" ADD CONSTRAINT "ControlEvidence_organizationId_controlId_fkey" FOREIGN KEY ("organizationId", "controlId") REFERENCES "Control"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlEvidence" ADD CONSTRAINT "ControlEvidence_organizationId_linkedByMembershipId_fkey" FOREIGN KEY ("organizationId", "linkedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEvidence" ADD CONSTRAINT "ExecutionEvidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEvidence" ADD CONSTRAINT "ExecutionEvidence_organizationId_evidenceId_fkey" FOREIGN KEY ("organizationId", "evidenceId") REFERENCES "Evidence"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEvidence" ADD CONSTRAINT "ExecutionEvidence_organizationId_controlExecutionId_fkey" FOREIGN KEY ("organizationId", "controlExecutionId") REFERENCES "ControlExecution"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEvidence" ADD CONSTRAINT "ExecutionEvidence_organizationId_linkedByMembershipId_fkey" FOREIGN KEY ("organizationId", "linkedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;


