-- CreateTable
CREATE TABLE "OrganizationUnit" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "parentId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrganizationUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationUnitMember" (
    "organizationId" UUID NOT NULL,
    "organizationUnitId" UUID NOT NULL,
    "membershipId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationUnitMember_pkey" PRIMARY KEY ("organizationId", "organizationUnitId", "membershipId")
);

-- CreateIndex
CREATE INDEX "OrganizationUnit_organizationId_parentId_idx" ON "OrganizationUnit"("organizationId", "parentId");
CREATE INDEX "OrganizationUnit_organizationId_isActive_idx" ON "OrganizationUnit"("organizationId", "isActive");
CREATE INDEX "OrganizationUnit_organizationId_name_idx" ON "OrganizationUnit"("organizationId", "name");
CREATE UNIQUE INDEX "OrganizationUnit_organizationId_id_key" ON "OrganizationUnit"("organizationId", "id");
CREATE UNIQUE INDEX "OrganizationUnit_organizationId_code_key" ON "OrganizationUnit"("organizationId", "code");
CREATE INDEX "OrganizationUnitMember_organizationId_membershipId_idx" ON "OrganizationUnitMember"("organizationId", "membershipId");
CREATE INDEX "OrganizationUnitMember_organizationId_organizationUnitId_idx" ON "OrganizationUnitMember"("organizationId", "organizationUnitId");

-- AddForeignKey
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationUnit" ADD CONSTRAINT "OrganizationUnit_organizationId_parentId_fkey" FOREIGN KEY ("organizationId", "parentId") REFERENCES "OrganizationUnit"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrganizationUnitMember" ADD CONSTRAINT "OrganizationUnitMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationUnitMember" ADD CONSTRAINT "OrganizationUnitMember_organizationId_organizationUnitId_fkey" FOREIGN KEY ("organizationId", "organizationUnitId") REFERENCES "OrganizationUnit"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationUnitMember" ADD CONSTRAINT "OrganizationUnitMember_organizationId_membershipId_fkey" FOREIGN KEY ("organizationId", "membershipId") REFERENCES "Membership"("organizationId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
