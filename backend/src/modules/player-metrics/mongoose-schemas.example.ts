/**
 * Mongoose Schema Examples for Player Metrics System (MongoDB)
 * 
 * This is an alternative implementation using MongoDB/Mongoose.
 * The current project uses Prisma with PostgreSQL, but this serves as
 * a reference for MongoDB implementation.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================
// ENUMS (as TypeScript enums for type safety)
// ============================================
export enum MetricCategory {
  TECHNICAL = 'TECHNICAL',
  PHYSICAL = 'PHYSICAL',
  MENTAL = 'MENTAL',
  ATTITUDE = 'ATTITUDE',
  GOALKEEPING = 'GOALKEEPING',
}

export enum PlayerPosition {
  GK = 'GK',
  CB = 'CB',
  FB = 'FB',
  WB = 'WB',
  DM = 'DM',
  CM = 'CM',
  AM = 'AM',
  W = 'W',
  ST = 'ST',
}

export enum MetricSourceContext {
  TRAINING_BLOCK = 'TRAINING_BLOCK',
  MATCH_BLOCK = 'MATCH_BLOCK',
  TRIAL = 'TRIAL',
  MONTHLY_REVIEW = 'MONTHLY_REVIEW',
  QUARTERLY_ASSESSMENT = 'QUARTERLY_ASSESSMENT',
  SEASON_START = 'SEASON_START',
  SEASON_END = 'SEASON_END',
  CUSTOM = 'CUSTOM',
}

export enum Role {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  STUDENT = 'STUDENT',
}

// ============================================
// INTERFACES
// ============================================

interface IMetricValue {
  key: string; // e.g., "first_touch"
  value: number; // 0-100
  confidence?: number; // 0-100, optional
  comment?: string;
}

interface IPositionalSuitability {
  position: PlayerPosition;
  suitability: number; // 0-100
  comment?: string;
}

interface ICoachTrait {
  key: string; // e.g., "work_rate", "leadership"
  value: number; // 0-100
  comment?: string;
}

interface IReadinessIndex {
  overall: number;
  technical: number;
  physical: number;
  mental: number;
  attitude: number;
  tacticalFit: number;
  explanation: {
    topStrengths: string[]; // metric keys
    topRisks: string[]; // metric keys
    recommendedFocus: string[]; // metric keys
    ruleTriggers: string[]; // rule-based insights
  };
}

interface IAuditDiff {
  metricKey: string;
  oldValue: number | null;
  newValue: number;
  comment?: string;
}

// ============================================
// METRIC DEFINITION SCHEMA
// ============================================
interface IMetricDefinition extends Document {
  key: string;
  displayName: string;
  category: MetricCategory;
  description?: string;
  minValue: number;
  maxValue: number;
  isActive: boolean;
  isCoachOnly: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const MetricDefinitionSchema = new Schema<IMetricDefinition>(
  {
    key: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    category: { type: String, enum: Object.values(MetricCategory), required: true, index: true },
    description: { type: String },
    minValue: { type: Number, default: 0 },
    maxValue: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true, index: true },
    isCoachOnly: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const MetricDefinition: Model<IMetricDefinition> = mongoose.model<IMetricDefinition>(
  'MetricDefinition',
  MetricDefinitionSchema
);

// ============================================
// PLAYER METRIC SNAPSHOT SCHEMA
// ============================================
interface IPlayerMetricSnapshot extends Document {
  playerId: mongoose.Types.ObjectId; // References Student/Player
  createdBy: mongoose.Types.ObjectId; // References Coach/Admin
  createdByRole: Role;
  createdAt: Date;
  sourceContext: MetricSourceContext;
  seasonId?: string;
  notes?: string;
  
  // Embedded data (MongoDB advantage: all in one document)
  values: IMetricValue[];
  positional: IPositionalSuitability[];
  coachTraits: ICoachTrait[];
  readinessIndex?: IReadinessIndex;
  
  // Audit info
  audit: {
    previousSnapshotId?: mongoose.Types.ObjectId;
    diff: IAuditDiff[];
    summary?: string;
  };
}

const MetricValueSchema = new Schema<IMetricValue>(
  {
    key: { type: String, required: true, index: true },
    value: { type: Number, required: true, min: 0, max: 100, index: true },
    confidence: { type: Number, min: 0, max: 100 },
    comment: { type: String },
  },
  { _id: false }
);

const PositionalSuitabilitySchema = new Schema<IPositionalSuitability>(
  {
    position: { type: String, enum: Object.values(PlayerPosition), required: true },
    suitability: { type: Number, required: true, min: 0, max: 100, index: true },
    comment: { type: String },
  },
  { _id: false }
);

const CoachTraitSchema = new Schema<ICoachTrait>(
  {
    key: { type: String, required: true },
    value: { type: Number, required: true, min: 0, max: 100 },
    comment: { type: String },
  },
  { _id: false }
);

const ReadinessIndexSchema = new Schema<IReadinessIndex>(
  {
    overall: { type: Number, required: true, min: 0, max: 100 },
    technical: { type: Number, required: true, min: 0, max: 100 },
    physical: { type: Number, required: true, min: 0, max: 100 },
    mental: { type: Number, required: true, min: 0, max: 100 },
    attitude: { type: Number, required: true, min: 0, max: 100 },
    tacticalFit: { type: Number, required: true, min: 0, max: 100 },
    explanation: {
      topStrengths: [String],
      topRisks: [String],
      recommendedFocus: [String],
      ruleTriggers: [String],
    },
  },
  { _id: false }
);

const AuditDiffSchema = new Schema<IAuditDiff>(
  {
    metricKey: { type: String, required: true },
    oldValue: { type: Number },
    newValue: { type: Number, required: true },
    comment: { type: String },
  },
  { _id: false }
);

const PlayerMetricSnapshotSchema = new Schema<IPlayerMetricSnapshot>(
  {
    playerId: { type: Schema.Types.ObjectId, required: true, ref: 'Student', index: true },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'Coach', index: true },
    createdByRole: { type: String, enum: [Role.ADMIN, Role.COACH], required: true },
    sourceContext: { type: String, enum: Object.values(MetricSourceContext), required: true, index: true },
    seasonId: { type: String, index: true },
    notes: { type: String },
    
    // Embedded arrays
    values: [MetricValueSchema],
    positional: [PositionalSuitabilitySchema],
    coachTraits: [CoachTraitSchema],
    readinessIndex: ReadinessIndexSchema,
    
    // Audit
    audit: {
      previousSnapshotId: { type: Schema.Types.ObjectId, ref: 'PlayerMetricSnapshot' },
      diff: [AuditDiffSchema],
      summary: { type: String },
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
PlayerMetricSnapshotSchema.index({ playerId: 1, createdAt: -1 }); // Timeline queries
PlayerMetricSnapshotSchema.index({ 'values.key': 1 }); // Filter by metric
PlayerMetricSnapshotSchema.index({ createdBy: 1, createdAt: -1 }); // Coach's snapshots
PlayerMetricSnapshotSchema.index({ sourceContext: 1, createdAt: -1 }); // Filter by context

export const PlayerMetricSnapshot: Model<IPlayerMetricSnapshot> = mongoose.model<IPlayerMetricSnapshot>(
  'PlayerMetricSnapshot',
  PlayerMetricSnapshotSchema
);

// ============================================
// COACH NOTE SCHEMA
// ============================================
interface IPlayerCoachNote extends Document {
  playerId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorRole: Role;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  body: string;
  tags: string[];
  relatedSnapshotId?: mongoose.Types.ObjectId;
  isVisibleToPlayer: boolean;
}

const PlayerCoachNoteSchema = new Schema<IPlayerCoachNote>(
  {
    playerId: { type: Schema.Types.ObjectId, required: true, ref: 'Student', index: true },
    authorId: { type: Schema.Types.ObjectId, required: true, ref: 'Coach', index: true },
    authorRole: { type: String, enum: [Role.ADMIN, Role.COACH], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    tags: [{ type: String, index: true }],
    relatedSnapshotId: { type: Schema.Types.ObjectId, ref: 'PlayerMetricSnapshot', index: true },
    isVisibleToPlayer: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

PlayerCoachNoteSchema.index({ playerId: 1, createdAt: -1 });
PlayerCoachNoteSchema.index({ authorId: 1, createdAt: -1 });
PlayerCoachNoteSchema.index({ tags: 1 });

export const PlayerCoachNote: Model<IPlayerCoachNote> = mongoose.model<IPlayerCoachNote>(
  'PlayerCoachNote',
  PlayerCoachNoteSchema
);

// ============================================
// EXAMPLE USAGE
// ============================================

/**
 * Example: Create a new snapshot
 */
export async function createPlayerMetricSnapshotMongo(
  playerId: string,
  payload: {
    createdBy: string;
    createdByRole: Role;
    sourceContext: MetricSourceContext;
    seasonId?: string;
    notes?: string;
    values: IMetricValue[];
    positional: IPositionalSuitability[];
    coachTraits: ICoachTrait[];
    previousSnapshotId?: string;
  }
) {
  // Get previous snapshot for diff calculation
  let previousSnapshot: IPlayerMetricSnapshot | null = null;
  if (payload.previousSnapshotId) {
    previousSnapshot = await PlayerMetricSnapshot.findById(payload.previousSnapshotId).lean();
  } else {
    // Get latest snapshot
    previousSnapshot = await PlayerMetricSnapshot.findOne({ playerId })
      .sort({ createdAt: -1 })
      .lean();
  }

  // Calculate diff
  const diff: IAuditDiff[] = [];
  if (previousSnapshot) {
    const oldValuesMap = new Map(previousSnapshot.values.map(v => [v.key, v.value]));
    payload.values.forEach(newVal => {
      const oldVal = oldValuesMap.get(newVal.key);
      if (oldVal !== undefined && oldVal !== newVal.value) {
        diff.push({
          metricKey: newVal.key,
          oldValue: oldVal,
          newValue: newVal.value,
        });
      }
    });
  }

  // Compute readiness index (simplified - implement full logic)
  const readinessIndex = computeReadinessIndexMongo(payload.values, payload.coachTraits);

  // Create snapshot
  const snapshot = new PlayerMetricSnapshot({
    playerId: new mongoose.Types.ObjectId(playerId),
    createdBy: new mongoose.Types.ObjectId(payload.createdBy),
    createdByRole: payload.createdByRole,
    sourceContext: payload.sourceContext,
    seasonId: payload.seasonId,
    notes: payload.notes,
    values: payload.values,
    positional: payload.positional,
    coachTraits: payload.coachTraits,
    readinessIndex,
    audit: {
      previousSnapshotId: previousSnapshot?._id,
      diff,
      summary: diff.length > 0 ? `${diff.length} metrics changed` : undefined,
    },
  });

  return await snapshot.save();
}

/**
 * Example: Get player timeline for a specific metric
 */
export async function getPlayerMetricTimelineMongo(
  playerId: string,
  metricKey: string,
  limit: number = 50
) {
  const snapshots = await PlayerMetricSnapshot.find({
    playerId,
    'values.key': metricKey,
  })
    .select('createdAt values readinessIndex')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return snapshots.map(snapshot => {
    const value = snapshot.values.find(v => v.key === metricKey);
    return {
      date: snapshot.createdAt,
      value: value?.value,
      confidence: value?.confidence,
      readiness: snapshot.readinessIndex?.overall,
    };
  });
}

/**
 * Example: Get latest snapshot
 */
export async function getLatestPlayerSnapshotMongo(playerId: string) {
  return await PlayerMetricSnapshot.findOne({ playerId })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'fullName email')
    .lean();
}

/**
 * Simplified readiness index computation (MongoDB version)
 */
function computeReadinessIndexMongo(
  values: IMetricValue[],
  traits: ICoachTrait[]
): IReadinessIndex {
  // Group by category (simplified - in real implementation, use MetricDefinition)
  const technical = values.filter(v => v.key.includes('touch') || v.key.includes('pass')).map(v => v.value);
  const physical = values.filter(v => v.key.includes('speed') || v.key.includes('stamina')).map(v => v.value);
  const mental = values.filter(v => v.key.includes('decision') || v.key.includes('vision')).map(v => v.value);
  const attitude = traits.map(t => t.value);

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 50;

  const technicalScore = avg(technical);
  const physicalScore = avg(physical);
  const mentalScore = avg(mental);
  const attitudeScore = avg(attitude);
  const tacticalFit = (technicalScore + mentalScore) / 2; // Simplified

  const overall = (technicalScore + physicalScore + mentalScore + attitudeScore + tacticalFit) / 5;

  // Find top strengths and risks
  const sortedValues = [...values, ...traits].sort((a, b) => b.value - a.value);
  const topStrengths = sortedValues.slice(0, 3).map(v => v.key);
  const topRisks = sortedValues.slice(-3).map(v => v.key);

  return {
    overall: Math.round(overall),
    technical: Math.round(technicalScore),
    physical: Math.round(physicalScore),
    mental: Math.round(mentalScore),
    attitude: Math.round(attitudeScore),
    tacticalFit: Math.round(tacticalFit),
    explanation: {
      topStrengths,
      topRisks,
      recommendedFocus: topRisks,
      ruleTriggers: [
        overall > 80 ? 'HIGH_READINESS' : '',
        physicalScore < 60 ? 'PHYSICAL_CONCERN' : '',
        attitudeScore > 90 ? 'EXCELLENT_ATTITUDE' : '',
      ].filter(Boolean),
    },
  };
}



