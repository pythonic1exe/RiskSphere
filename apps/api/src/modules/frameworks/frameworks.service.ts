import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { FrameworkCatalogStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import type { OrganizationAccess } from '../../common/auth/auth.types';
import { OrganizationAuthorizationService } from '../../common/authorization';

const DEFAULT_FRAMEWORKS = [
  {
    code: 'SOC_2',
    version: '2017',
    name: 'SOC 2',
    description: 'Trust Services Criteria',
  },
  {
    code: 'ISO_27001',
    version: '2022',
    name: 'ISO 27001',
    description: 'Information security management',
  },
  {
    code: 'NIST_CSF',
    version: '2.0',
    name: 'NIST CSF',
    description: 'Cybersecurity framework',
  },
  {
    code: 'HIPAA',
    version: '2013',
    name: 'HIPAA',
    description: 'Healthcare privacy and security',
  },
  {
    code: 'PCI_DSS',
    version: '4.0',
    name: 'PCI DSS',
    description: 'Payment card industry security standard',
  },
] as const;

@Injectable()
export class FrameworksService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: OrganizationAuthorizationService,
  ) {}

  async onModuleInit() {
    const existing = await this.prisma.frameworkCatalog.count();
    if (existing > 0) {
      return;
    }

    await this.prisma.frameworkCatalog.createMany({
      data: DEFAULT_FRAMEWORKS.map((framework) => ({
        code: framework.code,
        version: framework.version,
        name: framework.name,
        description: framework.description,
        status: FrameworkCatalogStatus.ACTIVE,
      })),
      skipDuplicates: true,
    });
  }

  async getCatalog() {
    const frameworks = await this.prisma.frameworkCatalog.findMany({
      orderBy: [{ name: 'asc' }],
    });

    return { frameworks };
  }

  async selectFramework(access: OrganizationAccess, frameworkCatalogId: string) {
    if (!this.authorizationService.canManageFrameworkSelections(access.roleCodes)) {
      throw new ForbiddenException('Not allowed to manage framework selections');
    }

    const framework = await this.prisma.frameworkCatalog.findUnique({
      where: { id: frameworkCatalogId },
    });

    if (!framework) {
      throw new NotFoundException('Framework catalog entry not found');
    }

    const selection = await this.prisma.organizationFrameworkSelection.upsert({
      where: {
        organizationId_frameworkCatalogId: {
          organizationId: access.organization.id,
          frameworkCatalogId,
        },
      },
      create: {
        organizationId: access.organization.id,
        frameworkCatalogId,
        selectedByMembershipId: access.membership.id,
      },
      update: {
        selectedByMembershipId: access.membership.id,
        selectedAt: new Date(),
      },
    });

    return {
      framework,
      selection,
    };
  }

  async unselectFramework(access: OrganizationAccess, frameworkCatalogId: string) {
    if (!this.authorizationService.canManageFrameworkSelections(access.roleCodes)) {
      throw new ForbiddenException('Not allowed to manage framework selections');
    }

    await this.prisma.organizationFrameworkSelection.deleteMany({
      where: {
        organizationId: access.organization.id,
        frameworkCatalogId,
      },
    });

    return { success: true };
  }
}
