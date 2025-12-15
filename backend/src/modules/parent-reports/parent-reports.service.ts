/**
 * Parent Development Reports Service
 * 
 * Generates parent-friendly development reports from player metric snapshots
 * Translates technical metrics into simple, reassuring language
 */

import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

export interface DevelopmentBand {
  label: 'Developing' | 'Strong' | 'Advancing';
  description: string;
}

export interface ParentReportContent {
  headline: string;
  bands: {
    technical: DevelopmentBand;
    physical: DevelopmentBand;
    gameUnderstanding: DevelopmentBand;
    attitude: DevelopmentBand;
  };
  strengths: string[]; // Max 3
  focusAreas: string[]; // Max 2-3
  coachNote: string; // 3-6 lines, plain language
  readinessStage: 'Foundation' | 'Developing' | 'Competitive' | 'Advanced';
  parentSupportTips: string[];
  transparencyMessage: string;
}

export interface CreateReportParams {
  studentId: number;
  snapshotId: number;
  reportingPeriodStart?: Date;
  reportingPeriodEnd?: Date;
  coachNote?: string; // Optional custom coach note
}

export interface PublishReportParams {
  reportId: number;
  publishedByUserId: number;
  publishedByRole: Role;
  visibleToParent?: boolean;
}

// ============================================
// TRANSLATION LOGIC
// ============================================

/**
 * Convert readiness score to parent-friendly band
 */
function getDevelopmentBand(score: number): DevelopmentBand {
  if (score >= 75) {
    return {
      label: 'Advancing',
      description: 'Your child is showing strong development in this area and is progressing well.',
    };
  } else if (score >= 60) {
    return {
      label: 'Strong',
      description: 'Your child is developing well in this area with consistent progress.',
    };
  } else {
    return {
      label: 'Developing',
      description: 'Your child is building skills in this area, which is normal at this stage of development.',
    };
  }
}

/**
 * Convert metric key to parent-friendly strength description
 */
function translateMetricToStrength(metricKey: string, value: number): string | null {
  const translations: Record<string, (v: number) => string> = {
    first_touch: () => 'Comfortable on the ball',
    passing: (v) => v >= 70 ? 'Good passing accuracy' : 'Improving passing skills',
    dribbling: () => 'Confident with the ball at feet',
    finishing: () => 'Good finishing ability',
    positioning: () => 'Improving positional awareness',
    work_rate: () => 'Good work rate during training',
    stamina: () => 'Building endurance across full sessions',
    speed: () => 'Good pace and acceleration',
    strength: () => 'Developing physical strength',
    composure: () => 'Stays calm under pressure',
    vision: () => 'Good awareness of teammates and space',
    decision_making: () => 'Making better decisions in game situations',
    communication: () => 'Communicates well with teammates',
    leadership: () => 'Shows leadership qualities',
    discipline: () => 'Maintains good discipline and focus',
  };

  const translator = translations[metricKey];
  if (!translator) return null;
  
  return translator(value);
}

/**
 * Convert metric key to parent-friendly focus area
 */
function translateMetricToFocusArea(metricKey: string): string | null {
  const translations: Record<string, string> = {
    decision_making: 'Decision-making in tight spaces',
    stamina: 'Building stamina across full sessions',
    positioning: 'Improving positional awareness',
    first_touch: 'First touch under pressure',
    passing: 'Passing accuracy in game situations',
    composure: 'Staying calm in challenging moments',
    communication: 'Communication with teammates',
    work_rate: 'Consistent effort throughout sessions',
  };

  return translations[metricKey] || null;
}

/**
 * Generate headline based on readiness band
 */
function generateHeadline(readinessOverall: number, statusBand: string): string {
  if (readinessOverall >= 85) {
    return 'Your child is progressing excellently and is developing at an advanced level for their age group.';
  } else if (readinessOverall >= 75) {
    return 'Your child is progressing well and is currently developing at an expected level for their age group.';
  } else if (readinessOverall >= 60) {
    return 'Your child is making steady progress and is developing appropriately for their age group.';
  } else if (readinessOverall >= 40) {
    return 'Your child is building foundational skills and is developing at a pace appropriate for their stage.';
  } else {
    return 'Your child is in the early stages of development, which is normal and expected.';
  }
}

/**
 * Generate parent support tips
 */
function generateParentSupportTips(): string[] {
  return [
    'Ensure regular attendance at training sessions',
    'Encourage proper hydration and rest between sessions',
    'Reinforce the importance of discipline and punctuality',
    'Support effort and attitude, not just outcomes',
    'Celebrate small improvements and consistent effort',
  ];
}

/**
 * Generate transparency message
 */
function generateTransparencyMessage(): string {
  return 'Development in football is non-linear and varies by age. Every child develops at their own pace. We avoid comparisons and focus on individual growth. Effort and consistency matter most.';
}

/**
 * Generate coach note from snapshot and readiness data
 */
function generateCoachNote(
  readiness: any,
  explanation: any,
  customNote?: string
): string {
  if (customNote) {
    return customNote;
  }

  // Generate note from readiness explanation
  const topStrengths = explanation?.topStrengths || [];
  const topRisks = explanation?.topRisks || [];
  const statusBand = readiness?.statusBand || 'Developing';

  let note = `Over the past period, we've seen ${topStrengths.length > 0 ? 'good progress' : 'steady development'} in training. `;

  if (topRisks.length > 0) {
    const focusArea = translateMetricToFocusArea(topRisks[0]);
    if (focusArea) {
      note += `The next focus will be ${focusArea.toLowerCase()}. `;
    }
  }

  note += 'With consistent attendance and effort, we expect continued improvement. Keep up the great work!';

  return note;
}

// ============================================
// REPORT GENERATION
// ============================================

/**
 * Generate parent-friendly report content from snapshot
 */
export async function generateReportContent(
  params: CreateReportParams
): Promise<ParentReportContent> {
  const { studentId, snapshotId, reportingPeriodStart, reportingPeriodEnd, coachNote } = params;

  // Load snapshot with all related data
  const snapshot = await prisma.playerMetricSnapshot.findUnique({
    where: { id: snapshotId },
    include: {
      student: true,
      readiness: true,
      values: {
        include: { metricDefinition: true },
      },
      traits: {
        include: { metricDefinition: true },
      },
    },
  });

  if (!snapshot) {
    throw new Error('Snapshot not found');
  }

  if (snapshot.studentId !== studentId) {
    throw new Error('Snapshot does not belong to this student');
  }

  const readiness = snapshot.readiness;
  if (!readiness) {
    throw new Error('Snapshot does not have readiness data');
  }

  // Generate bands
  const technicalBand = getDevelopmentBand(readiness.technical);
  const physicalBand = getDevelopmentBand(readiness.physical);
  const mentalBand = getDevelopmentBand(readiness.mental);
  const attitudeBand = getDevelopmentBand(readiness.attitude);

  // Generate strengths (top 3 metrics)
  const allMetrics = [
    ...snapshot.values.map(v => ({
      key: v.metricDefinition.key,
      value: v.valueNumber,
      category: v.metricDefinition.category,
    })),
    ...snapshot.traits.map(t => ({
      key: t.metricDefinition.key,
      value: t.valueNumber,
      category: 'ATTITUDE',
    })),
  ];

  const strengths: string[] = [];
  const sortedMetrics = [...allMetrics].sort((a, b) => b.value - a.value);
  for (const metric of sortedMetrics.slice(0, 5)) {
    const strength = translateMetricToStrength(metric.key, metric.value);
    if (strength && !strengths.includes(strength) && strengths.length < 3) {
      strengths.push(strength);
    }
  }

  // Generate focus areas (bottom 2-3 metrics)
  const focusAreas: string[] = [];
  const bottomMetrics = [...sortedMetrics].reverse().slice(0, 5);
  for (const metric of bottomMetrics) {
    const focusArea = translateMetricToFocusArea(metric.key);
    if (focusArea && !focusAreas.includes(focusArea) && focusAreas.length < 3) {
      focusAreas.push(focusArea);
    }
  }

  // Generate coach note
  const generatedCoachNote = generateCoachNote(
    readiness,
    readiness.explanationJson,
    coachNote
  );

  // Determine readiness stage
  let readinessStage: ParentReportContent['readinessStage'] = 'Developing';
  if (readiness.overall >= 85) readinessStage = 'Advanced';
  else if (readiness.overall >= 75) readinessStage = 'Advanced';
  else if (readiness.overall >= 60) readinessStage = 'Competitive';
  else if (readiness.overall >= 40) readinessStage = 'Developing';
  else readinessStage = 'Foundation';

  return {
    headline: generateHeadline(readiness.overall, readinessStage),
    bands: {
      technical: technicalBand,
      physical: physicalBand,
      gameUnderstanding: mentalBand, // Mental = game understanding for parents
      attitude: attitudeBand,
    },
    strengths,
    focusAreas,
    coachNote: generatedCoachNote,
    readinessStage,
    parentSupportTips: generateParentSupportTips(),
    transparencyMessage: generateTransparencyMessage(),
  };
}

/**
 * Create a new parent development report
 */
export async function createParentReport(params: CreateReportParams) {
  try {
    const content = await generateReportContent(params);

    return await prisma.parentDevelopmentReport.create({
    data: {
      studentId: params.studentId,
      snapshotId: params.snapshotId,
      reportingPeriodStart: params.reportingPeriodStart,
      reportingPeriodEnd: params.reportingPeriodEnd,
      contentJson: content as any, // Cast to any for Prisma Json type compatibility
      visibleToParent: false, // Draft by default
    },
    include: {
      student: {
        select: { fullName: true, programType: true },
      },
      snapshot: {
        select: { createdAt: true },
      },
    },
    });
  } catch (error: any) {
    if (error.message && error.message.includes('parentDevelopmentReport')) {
      throw new Error('ParentDevelopmentReport model not available. Please stop the backend server and run: cd backend && npx prisma generate');
    }
    throw error;
  }
}

/**
 * Publish a report (make it visible to parent/player)
 */
export async function publishReport(params: PublishReportParams) {
  try {
    const { reportId, publishedByUserId, publishedByRole, visibleToParent = true } = params;

    return await prisma.parentDevelopmentReport.update({
    where: { id: reportId },
    data: {
      publishedAt: new Date(),
      publishedByUserId: publishedByUserId,
      publishedByRole: publishedByRole,
      visibleToParent: visibleToParent,
    },
    include: {
      student: {
        select: { fullName: true },
      },
      publishedBy: {
        select: { fullName: true },
      },
    },
    });
  } catch (error: any) {
    if (error.message && error.message.includes('parentDevelopmentReport')) {
      throw new Error('ParentDevelopmentReport model not available. Please stop the backend server and run: cd backend && npx prisma generate');
    }
    throw error;
  }
}

/**
 * Get reports for a student (filtered by visibility)
 */
export async function getStudentReports(
  studentId: number,
  includeDrafts: boolean = false
) {
  try {
    const where: any = { studentId };
    
    if (!includeDrafts) {
      where.visibleToParent = true;
    }

    return await prisma.parentDevelopmentReport.findMany({
    where,
    include: {
      snapshot: {
        select: { createdAt: true, sourceContext: true },
      },
      publishedBy: {
        select: { fullName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    });
  } catch (error: any) {
    if (error.message && (error.message.includes('parentDevelopmentReport') || error.message.includes('findMany'))) {
      throw new Error('ParentDevelopmentReport model not available. Please stop the backend server and run: cd backend && npx prisma generate');
    }
    throw error;
  }
}

/**
 * Get a specific report
 */
export async function getReport(reportId: number) {
  try {
    return await prisma.parentDevelopmentReport.findUnique({
    where: { id: reportId },
    include: {
      student: {
        include: {
          center: {
            select: { name: true },
          },
        },
      },
      snapshot: {
        select: { createdAt: true, sourceContext: true },
      },
      publishedBy: {
        select: { fullName: true, email: true },
      },
    },
    });
  } catch (error: any) {
    if (error.message && (error.message.includes('parentDevelopmentReport') || error.message.includes('findUnique'))) {
      throw new Error('ParentDevelopmentReport model not available. Please stop the backend server and run: cd backend && npx prisma generate');
    }
    throw error;
  }
}

/**
 * Update report content
 */
export async function updateReport(
  reportId: number,
  data: {
    reportingPeriodStart?: Date;
    reportingPeriodEnd?: Date;
    contentJson?: any;
    coachNote?: string;
  }
) {
  try {
    // If coachNote is provided, regenerate content
    if (data.coachNote) {
      const report = await prisma.parentDevelopmentReport.findUnique({
      where: { id: reportId },
      include: {
        snapshot: {
          include: {
            readiness: true,
          },
        },
      },
    });

    if (report) {
      const content = await generateReportContent({
        studentId: report.studentId,
        snapshotId: report.snapshotId,
        coachNote: data.coachNote,
      });
      data.contentJson = content;
    }
  }

    return await prisma.parentDevelopmentReport.update({
      where: { id: reportId },
      data: {
        reportingPeriodStart: data.reportingPeriodStart,
        reportingPeriodEnd: data.reportingPeriodEnd,
        contentJson: data.contentJson,
      },
    });
  } catch (error: any) {
    if (error.message && (error.message.includes('parentDevelopmentReport') || error.message.includes('findUnique') || error.message.includes('update'))) {
      throw new Error('ParentDevelopmentReport model not available. Please stop the backend server and run: cd backend && npx prisma generate');
    }
    throw error;
  }
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: number) {
  try {
    return await prisma.parentDevelopmentReport.delete({
      where: { id: reportId },
    });
  } catch (error: any) {
    if (error.message && (error.message.includes('parentDevelopmentReport') || error.message.includes('delete'))) {
      throw new Error('ParentDevelopmentReport model not available. Please stop the backend server and run: cd backend && npx prisma generate');
    }
    throw error;
  }
}

