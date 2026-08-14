-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TaskSourceType" AS ENUM ('MANUAL', 'FINDING');

-- CreateEnum
CREATE TYPE "TaskActivityType" AS ENUM ('CREATED', 'UPDATED', 'ASSIGNED', 'UNASSIGNED', 'REASSIGNED', 'PRIORITY_CHANGED', 'DUE_DATE_CHANGED', 'STARTED', 'BLOCKED', 'UNBLOCKED', 'COMPLETED', 'REOPENED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TaskSequence" (
    "organizationId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "TaskSequence_pkey" PRIMARY KEY ("organizationId","year")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "taskNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "sourceType" "TaskSourceType" NOT NULL,
    "findingId" UUID,
    "assigneeMembershipId" UUID,
    "dueDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "blockedReason" TEXT,
    "completionNotes" TEXT,
    "cancellationReason" TEXT,
    "createdByMembershipId" UUID NOT NULL,
    "updatedByMembershipId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskActivity" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "actorMembershipId" UUID NOT NULL,
    "type" "TaskActivityType" NOT NULL,
    "fromStatus" "TaskStatus",
    "toStatus" "TaskStatus",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_organizationId_status_updatedAt_idx" ON "Task"("organizationId", "status", "updatedAt");
CREATE INDEX "Task_organizationId_priority_updatedAt_idx" ON "Task"("organizationId", "priority", "updatedAt");
CREATE INDEX "Task_organizationId_assigneeMembershipId_idx" ON "Task"("organizationId", "assigneeMembershipId");
CREATE INDEX "Task_organizationId_dueDate_idx" ON "Task"("organizationId", "dueDate");
CREATE INDEX "Task_organizationId_sourceType_idx" ON "Task"("organizationId", "sourceType");
CREATE INDEX "Task_organizationId_findingId_idx" ON "Task"("organizationId", "findingId");
CREATE INDEX "Task_organizationId_createdAt_idx" ON "Task"("organizationId", "createdAt");
CREATE UNIQUE INDEX "Task_organizationId_taskNumber_key" ON "Task"("organizationId", "taskNumber");
CREATE UNIQUE INDEX "Task_organizationId_id_key" ON "Task"("organizationId", "id");
CREATE INDEX "TaskActivity_organizationId_taskId_createdAt_idx" ON "TaskActivity"("organizationId", "taskId", "createdAt");
CREATE INDEX "TaskActivity_organizationId_actorMembershipId_idx" ON "TaskActivity"("organizationId", "actorMembershipId");
CREATE UNIQUE INDEX "TaskActivity_organizationId_id_key" ON "TaskActivity"("organizationId", "id");

-- AddForeignKey
ALTER TABLE "TaskSequence" ADD CONSTRAINT "TaskSequence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_findingId_fkey" FOREIGN KEY ("organizationId", "findingId") REFERENCES "Finding"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_assigneeMembershipId_fkey" FOREIGN KEY ("organizationId", "assigneeMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_createdByMembershipId_fkey" FOREIGN KEY ("organizationId", "createdByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_updatedByMembershipId_fkey" FOREIGN KEY ("organizationId", "updatedByMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_organizationId_taskId_fkey" FOREIGN KEY ("organizationId", "taskId") REFERENCES "Task"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_organizationId_actorMembershipId_fkey" FOREIGN KEY ("organizationId", "actorMembershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
