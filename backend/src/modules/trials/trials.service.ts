/**
 * Trial Management Service
 * 
 * Handles trial events, trialists, reports, templates, and comparisons
 */

import { PrismaClient, Role, TrialEventStatus, TrialObservationType, TrialRecommendedAction, TrialPositionScope } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

export interface CreateTrialEventParams {
  title: string;
  centerId: number;
  startDateTime: Date;
  endDateTime: Date;
  ageGroups: string[];
  positionsNeeded: string[];
  format?: string;
  notes?: string;
  staffIds?: number[];
  createdByUserId: number;
  createdByRole: Role;
}

export interface CreateTrialistParams {
  fullName: string;
  phone?: string;
  guardianPhone?: string;
  email?: string;
  dateOfBirth?: Date;
  preferredFoot?: string;
  primaryPosition?: string;
  secondaryPositions?: string[];
  currentClub?: string;
  location?: string;
  height?: number;
  weight?: number;
  injuryNotes?: string;
  consentAccepted?: boolean;
}

export interface CreateTrialReportParams {
  trialEventId: number;
  trialistId: number;
  templateId: number;
  createdByCoachId: number;
  observedPosition: string;
  ageGroup: string;
  observationType: TrialObservationType;
  confidence?: number;
  minutesObserved?: number;
  weatherNotes?: string;
  pitchNotes?: string;
  strengths: string[];
  risks: string[];
  coachSummary?: string;
  recommendedAction: TrialRecommendedAction;
  decisionNotes?: string;
  metricValues: Array<{
    templateItemId: number;
    value: number;
    comment?: string;
    confidence?: number;
  }>;
  positionalSuitability?: Array<{
    position: string;
    suitability: number;
    comment?: string;
  }>;
}

export interface CreateTemplateParams {
  name: string;
  positionScope: TrialPositionScope;
  specificPositions?: string[];
  ageScope?: string[];
  description?: string;
  isDefault?: boolean;
  createdByCoachId: number;
  items: Array<{
    metricKey: string;
    displayName: string;
    category: string;
    description?: string;
    anchors?: any;
    weight?: number;
    required?: boolean;
    displayOrder?: number;
  }>;
}

// ============================================
// TRIAL EVENT OPERATIONS
// ============================================

export async function createTrialEvent(params: CreateTrialEventParams) {
  const { staffIds, ...eventData } = params;

  const event = await prisma.trialEvent.create({
    data: {
      ...eventData,
      staffAssigned: staffIds && staffIds.length > 0 ? {
        create: staffIds.map(coachId => ({ coachId })),
      } : undefined,
    },
    include: {
      center: true,
      createdBy: {
        select: { fullName: true, email: true },
      },
      staffAssigned: {
        include: {
          coach: {
            select: { fullName: true, email: true },
          },
        },
      },
      _count: {
        select: {
          trialists: true,
          reports: true,
        },
      },
    },
  });

  return event;
}

export async function getTrialEvents(params?: {
  centerId?: number;
  status?: TrialEventStatus;
  coachId?: number;
}) {
  const where: any = {};

  if (params?.centerId) {
    where.centerId = params.centerId;
  }

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.coachId) {
    where.OR = [
      { createdByUserId: params.coachId },
      { staffAssigned: { some: { coachId: params.coachId } } },
    ];
  }

  return await prisma.trialEvent.findMany({
    where,
    include: {
      center: true,
      createdBy: {
        select: { fullName: true },
      },
      _count: {
        select: {
          trialists: true,
          reports: true,
          staffAssigned: true,
        },
      },
    },
    orderBy: { startDateTime: 'desc' },
  });
}

export async function getTrialEvent(eventId: number) {
  return await prisma.trialEvent.findUnique({
    where: { id: eventId },
    include: {
      center: true,
      createdBy: {
        select: { fullName: true, email: true },
      },
      staffAssigned: {
        include: {
          coach: {
            select: { fullName: true, email: true },
          },
        },
      },
      trialists: {
        include: {
          trialist: true,
        },
      },
      reports: {
        include: {
          trialist: true,
          createdBy: {
            select: { fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      shortlists: {
        include: {
          items: {
            include: {
              trialist: true,
            },
          },
        },
      },
    },
  });
}

export async function updateTrialEvent(
  eventId: number,
  data: {
    title?: string;
    startDateTime?: Date;
    endDateTime?: Date;
    ageGroups?: string[];
    positionsNeeded?: string[];
    format?: string;
    status?: TrialEventStatus;
    notes?: string;
  }
) {
  return await prisma.trialEvent.update({
    where: { id: eventId },
    data,
  });
}

export async function addStaffToEvent(eventId: number, coachId: number, role?: string) {
  return await prisma.trialEventStaff.create({
    data: {
      trialEventId: eventId,
      coachId,
      role,
    },
    include: {
      coach: {
        select: { fullName: true, email: true },
      },
    },
  });
}

export async function removeStaffFromEvent(eventId: number, coachId: number) {
  return await prisma.trialEventStaff.delete({
    where: {
      trialEventId_coachId: {
        trialEventId: eventId,
        coachId,
      },
    },
  });
}

// ============================================
// TRIALIST OPERATIONS
// ============================================

export async function createTrialist(params: CreateTrialistParams) {
  return await prisma.trialist.create({
    data: {
      ...params,
      consentAcceptedAt: params.consentAccepted ? new Date() : undefined,
    },
  });
}

export async function getTrialists(params?: {
  search?: string;
  primaryPosition?: string;
  ageGroup?: string;
}) {
  const where: any = {};

  if (params?.search) {
    where.OR = [
      { fullName: { contains: params.search, mode: 'insensitive' } },
      { phone: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params?.primaryPosition) {
    where.primaryPosition = params.primaryPosition;
  }

  return await prisma.trialist.findMany({
    where,
    include: {
      _count: {
        select: {
          trialEvents: true,
          reports: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTrialist(trialistId: number) {
  return await prisma.trialist.findUnique({
    where: { id: trialistId },
    include: {
      trialEvents: {
        include: {
          trialEvent: {
            include: {
              center: true,
            },
          },
        },
      },
      reports: {
        include: {
          trialEvent: true,
          createdBy: {
            select: { fullName: true },
          },
          template: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function updateTrialist(trialistId: number, data: Partial<CreateTrialistParams>) {
  return await prisma.trialist.update({
    where: { id: trialistId },
    data: {
      ...data,
      consentAcceptedAt: data.consentAccepted ? new Date() : undefined,
    },
  });
}

export async function addTrialistToEvent(eventId: number, trialistId: number, notes?: string) {
  return await prisma.trialEventTrialist.create({
    data: {
      trialEventId: eventId,
      trialistId,
      notes,
    },
    include: {
      trialist: true,
    },
  });
}

export async function removeTrialistFromEvent(eventId: number, trialistId: number) {
  return await prisma.trialEventTrialist.delete({
    where: {
      trialEventId_trialistId: {
        trialEventId: eventId,
        trialistId,
      },
    },
  });
}

// ============================================
// TEMPLATE OPERATIONS
// ============================================

export async function createTemplate(params: CreateTemplateParams) {
  const { items, ...templateData } = params;

  return await prisma.trialMetricTemplate.create({
    data: {
      ...templateData,
      items: {
        create: items.map(item => ({
          metricKey: item.metricKey,
          displayName: item.displayName,
          category: item.category as any,
          description: item.description,
          anchors: item.anchors,
          weight: item.weight,
          required: item.required || false,
          displayOrder: item.displayOrder || 0,
        })),
      },
    },
    include: {
      items: {
        orderBy: { displayOrder: 'asc' },
      },
      createdBy: {
        select: { fullName: true },
      },
    },
  });
}

export async function getTemplates(params?: {
  positionScope?: TrialPositionScope;
  position?: string;
  ageGroup?: string;
}) {
  const where: any = {};

  if (params?.positionScope) {
    where.positionScope = params.positionScope;
  }

  if (params?.position) {
    where.OR = [
      { positionScope: 'ANY' },
      { positionScope: 'OUTFIELD', specificPositions: { has: params.position } },
      { positionScope: 'GK', specificPositions: { has: params.position } },
    ];
  }

  return await prisma.trialMetricTemplate.findMany({
    where,
    include: {
      items: {
        orderBy: { displayOrder: 'asc' },
      },
      createdBy: {
        select: { fullName: true },
      },
      _count: {
        select: { reports: true },
      },
    },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function getTemplate(templateId: number) {
  return await prisma.trialMetricTemplate.findUnique({
    where: { id: templateId },
    include: {
      items: {
        orderBy: { displayOrder: 'asc' },
      },
      createdBy: {
        select: { fullName: true },
      },
    },
  });
}

export async function updateTemplate(templateId: number, data: Partial<CreateTemplateParams>) {
  const { items, ...templateData } = data;

  return await prisma.trialMetricTemplate.update({
    where: { id: templateId },
    data: {
      ...templateData,
      items: items ? {
        deleteMany: {},
        create: items.map(item => ({
          metricKey: item.metricKey,
          displayName: item.displayName,
          category: item.category as any,
          description: item.description,
          anchors: item.anchors,
          weight: item.weight,
          required: item.required || false,
          displayOrder: item.displayOrder || 0,
        })),
      } : undefined,
    },
    include: {
      items: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

// ============================================
// TRIAL REPORT OPERATIONS
// ============================================

/**
 * Calculate overall score from metric values and template weights
 */
function calculateOverallScore(
  metricValues: Array<{ templateItemId: number; value: number }>,
  templateItems: Array<{ id: number; weight: number | null }>
): number {
  const itemMap = new Map(templateItems.map(item => [item.id, item.weight || 1]));
  
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const mv of metricValues) {
    const weight = itemMap.get(mv.templateItemId) || 1;
    totalWeighted += mv.value * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalWeighted / totalWeight : 0;
}

export async function createTrialReport(params: CreateTrialReportParams) {
  const { metricValues, positionalSuitability, ...reportData } = params;

  // Get template to calculate overall score
  const template = await prisma.trialMetricTemplate.findUnique({
    where: { id: params.templateId },
    include: { items: true },
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Calculate overall score
  const overallScore = calculateOverallScore(
    metricValues,
    template.items
  );

  // Apply confidence adjustment if provided
  const adjustedScore = params.confidence
    ? overallScore * (0.7 + 0.3 * params.confidence / 100)
    : overallScore;

  const report = await prisma.trialReport.create({
    data: {
      ...reportData,
      overallScore: adjustedScore,
      values: {
        create: metricValues.map(mv => ({
          templateItemId: mv.templateItemId,
          value: mv.value,
          comment: mv.comment,
          confidence: mv.confidence,
        })),
      },
      positional: positionalSuitability ? {
        create: positionalSuitability.map(pos => ({
          position: pos.position,
          suitability: pos.suitability,
          comment: pos.comment,
        })),
      } : undefined,
    },
    include: {
      trialEvent: true,
      trialist: true,
      template: {
        include: { items: true },
      },
      createdBy: {
        select: { fullName: true },
      },
      values: {
        include: {
          templateItem: true,
        },
      },
      positional: true,
    },
  });

  return report;
}

export async function getTrialReports(params?: {
  trialEventId?: number;
  trialistId?: number;
  coachId?: number;
  position?: string;
  ageGroup?: string;
  recommendedAction?: TrialRecommendedAction;
}) {
  const where: any = {};

  if (params?.trialEventId) where.trialEventId = params.trialEventId;
  if (params?.trialistId) where.trialistId = params.trialistId;
  if (params?.coachId) where.createdByCoachId = params.coachId;
  if (params?.position) where.observedPosition = params.position;
  if (params?.ageGroup) where.ageGroup = params.ageGroup;
  if (params?.recommendedAction) where.recommendedAction = params.recommendedAction;

  return await prisma.trialReport.findMany({
    where,
    include: {
      trialEvent: true,
      trialist: true,
      template: {
        include: { items: true },
      },
      createdBy: {
        select: { fullName: true },
      },
      values: {
        include: {
          templateItem: true,
        },
      },
      positional: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTrialReport(reportId: number) {
  return await prisma.trialReport.findUnique({
    where: { id: reportId },
    include: {
      trialEvent: true,
      trialist: true,
      template: {
        include: { items: true },
      },
      createdBy: {
        select: { fullName: true, email: true },
      },
      values: {
        include: {
          templateItem: true,
        },
      },
      positional: true,
      revisions: {
        include: {
          revisedBy: {
            select: { fullName: true },
          },
        },
        orderBy: { revisedAt: 'desc' },
      },
    },
  });
}

export async function updateTrialReport(
  reportId: number,
  data: Partial<CreateTrialReportParams>,
  revisedByCoachId: number
) {
  // Get existing report for revision history
  const existingReport = await prisma.trialReport.findUnique({
    where: { id: reportId },
    include: {
      values: {
        include: { templateItem: true },
      },
      positional: true,
    },
  });

  if (!existingReport) {
    throw new Error('Report not found');
  }

  // Create revision snapshot
  await prisma.trialReportRevision.create({
    data: {
      reportId,
      previousData: {
        strengths: existingReport.strengths,
        risks: existingReport.risks,
        coachSummary: existingReport.coachSummary,
        recommendedAction: existingReport.recommendedAction,
        decisionNotes: existingReport.decisionNotes,
        values: existingReport.values.map(v => ({
          metricKey: v.templateItem.metricKey,
          value: v.value,
          comment: v.comment,
        })),
        positional: existingReport.positional.map(p => ({
          position: p.position,
          suitability: p.suitability,
          comment: p.comment,
        })),
      },
      revisedByCoachId,
    },
  });

  // Update report
  const { metricValues, positionalSuitability, ...reportData } = data;

  // Recalculate overall score if metric values changed
  let overallScore = existingReport.overallScore;
  if (metricValues && metricValues.length > 0) {
    const template = await prisma.trialMetricTemplate.findUnique({
      where: { id: existingReport.templateId },
      include: { items: true },
    });
    if (template) {
      overallScore = calculateOverallScore(
        metricValues,
        template.items
      );
      if (data.confidence) {
        overallScore = overallScore * (0.7 + 0.3 * data.confidence / 100);
      }
    }
  }

  return await prisma.trialReport.update({
    where: { id: reportId },
    data: {
      ...reportData,
      overallScore,
      values: metricValues ? {
        deleteMany: {},
        create: metricValues.map(mv => ({
          templateItemId: mv.templateItemId,
          value: mv.value,
          comment: mv.comment,
          confidence: mv.confidence,
        })),
      } : undefined,
      positional: positionalSuitability ? {
        deleteMany: {},
        create: positionalSuitability.map(pos => ({
          position: pos.position,
          suitability: pos.suitability,
          comment: pos.comment,
        })),
      } : undefined,
    },
    include: {
      values: {
        include: {
          templateItem: true,
        },
      },
      positional: true,
    },
  });
}

// ============================================
// COMPARISON & SHORTLIST OPERATIONS
// ============================================

export async function compareTrialists(params: {
  trialistIds: number[];
  trialEventId?: number;
  position: string;
  ageGroup: string;
}) {
  const { trialistIds, trialEventId, position, ageGroup } = params;

  // Get reports for these trialists in the same context
  const where: any = {
    trialistId: { in: trialistIds },
    observedPosition: position,
    ageGroup,
  };

  if (trialEventId) {
    where.trialEventId = trialEventId;
  }

  const reports = await prisma.trialReport.findMany({
    where,
    include: {
      trialist: true,
      template: {
        include: { items: true },
      },
      values: {
        include: {
          templateItem: true,
        },
      },
      positional: true,
      createdBy: {
        select: { fullName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by trialist (get latest report per trialist)
  const trialistReports = new Map<number, typeof reports[0]>();
  for (const report of reports) {
    if (!trialistReports.has(report.trialistId)) {
      trialistReports.set(report.trialistId, report);
    }
  }

  return Array.from(trialistReports.values());
}

export async function createShortlist(params: {
  trialEventId: number;
  name: string;
  description?: string;
  createdByCoachId: number;
}) {
  return await prisma.trialShortlist.create({
    data: params,
    include: {
      items: {
        include: {
          trialist: true,
        },
      },
    },
  });
}

export async function addTrialistToShortlist(shortlistId: number, trialistId: number, notes?: string) {
  return await prisma.trialShortlistItem.create({
    data: {
      shortlistId,
      trialistId,
      notes,
    },
    include: {
      trialist: true,
    },
  });
}

export async function removeTrialistFromShortlist(shortlistId: number, trialistId: number) {
  return await prisma.trialShortlistItem.delete({
    where: {
      shortlistId_trialistId: {
        shortlistId,
        trialistId,
      },
    },
  });
}

export async function createDecision(params: {
  trialEventId: number;
  trialistId: number;
  decision: TrialRecommendedAction;
  notes?: string;
  decidedByCoachId: number;
}) {
  return await prisma.trialDecisionLog.create({
    data: params,
    include: {
      trialist: true,
      decidedBy: {
        select: { fullName: true },
      },
    },
  });
}

