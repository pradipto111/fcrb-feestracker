/**
 * Seed Player Metric Definitions
 * 
 * Seeds the PlayerMetricDefinition table with comprehensive Football Manager-style metrics.
 * Run with: ts-node prisma/seed-metrics.ts
 */

import { PrismaClient, MetricCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface MetricSeed {
  key: string;
  displayName: string;
  category: MetricCategory;
  description?: string;
  minValue?: number;
  maxValue?: number;
  isCoachOnly?: boolean;
  displayOrder: number;
}

const metrics: MetricSeed[] = [
  // ============================================
  // TECHNICAL METRICS
  // ============================================
  {
    key: 'first_touch',
    displayName: 'First Touch',
    category: 'TECHNICAL',
    description: 'Ability to control the ball cleanly on first contact',
    displayOrder: 1,
  },
  {
    key: 'passing',
    displayName: 'Passing',
    category: 'TECHNICAL',
    description: 'Accuracy and technique in passing the ball',
    displayOrder: 2,
  },
  {
    key: 'long_passing',
    displayName: 'Long Passing',
    category: 'TECHNICAL',
    description: 'Ability to execute accurate long-range passes',
    displayOrder: 3,
  },
  {
    key: 'crossing',
    displayName: 'Crossing',
    category: 'TECHNICAL',
    description: 'Quality of crosses from wide positions',
    displayOrder: 4,
  },
  {
    key: 'dribbling',
    displayName: 'Dribbling',
    category: 'TECHNICAL',
    description: 'Ability to carry the ball past opponents',
    displayOrder: 5,
  },
  {
    key: 'ball_control',
    displayName: 'Ball Control',
    category: 'TECHNICAL',
    description: 'Overall ability to control and manipulate the ball',
    displayOrder: 6,
  },
  {
    key: 'shooting',
    displayName: 'Shooting',
    category: 'TECHNICAL',
    description: 'Accuracy and power in shooting',
    displayOrder: 7,
  },
  {
    key: 'finishing',
    displayName: 'Finishing',
    category: 'TECHNICAL',
    description: 'Ability to convert chances into goals',
    displayOrder: 8,
  },
  {
    key: 'heading',
    displayName: 'Heading',
    category: 'TECHNICAL',
    description: 'Ability to win and direct headers',
    displayOrder: 9,
  },
  {
    key: 'tackling',
    displayName: 'Tackling',
    category: 'TECHNICAL',
    description: 'Timing and technique in winning the ball',
    displayOrder: 10,
  },
  {
    key: 'marking',
    displayName: 'Marking',
    category: 'TECHNICAL',
    description: 'Ability to track and mark opponents',
    displayOrder: 11,
  },
  {
    key: 'interceptions',
    displayName: 'Interceptions',
    category: 'TECHNICAL',
    description: 'Ability to read and intercept passes',
    displayOrder: 12,
  },
  {
    key: 'set_pieces',
    displayName: 'Set Pieces',
    category: 'TECHNICAL',
    description: 'Quality of free kicks and corners',
    displayOrder: 13,
  },
  {
    key: 'technique',
    displayName: 'Technique',
    category: 'TECHNICAL',
    description: 'Overall technical ability and skill level',
    displayOrder: 14,
  },

  // ============================================
  // PHYSICAL METRICS
  // ============================================
  {
    key: 'acceleration',
    displayName: 'Acceleration',
    category: 'PHYSICAL',
    description: 'Ability to reach top speed quickly',
    displayOrder: 15,
  },
  {
    key: 'sprint_speed',
    displayName: 'Sprint Speed',
    category: 'PHYSICAL',
    description: 'Maximum running speed',
    displayOrder: 16,
  },
  {
    key: 'agility',
    displayName: 'Agility',
    category: 'PHYSICAL',
    description: 'Ability to change direction quickly',
    displayOrder: 17,
  },
  {
    key: 'balance',
    displayName: 'Balance',
    category: 'PHYSICAL',
    description: 'Ability to maintain balance in challenging situations',
    displayOrder: 18,
  },
  {
    key: 'jumping',
    displayName: 'Jumping',
    category: 'PHYSICAL',
    description: 'Vertical leap ability',
    displayOrder: 19,
  },
  {
    key: 'stamina',
    displayName: 'Stamina',
    category: 'PHYSICAL',
    description: 'Endurance and ability to maintain performance',
    displayOrder: 20,
  },
  {
    key: 'strength',
    displayName: 'Strength',
    category: 'PHYSICAL',
    description: 'Physical power and ability to hold off opponents',
    displayOrder: 21,
  },
  {
    key: 'natural_fitness',
    displayName: 'Natural Fitness',
    category: 'PHYSICAL',
    description: 'Base level of physical conditioning',
    displayOrder: 22,
  },
  {
    key: 'injury_proneness',
    displayName: 'Injury Proneness',
    category: 'PHYSICAL',
    description: 'Likelihood of sustaining injuries (lower is better)',
    isCoachOnly: true,
    displayOrder: 23,
  },

  // ============================================
  // MENTAL METRICS
  // ============================================
  {
    key: 'vision',
    displayName: 'Vision',
    category: 'MENTAL',
    description: 'Ability to see and execute creative passes',
    displayOrder: 24,
  },
  {
    key: 'composure',
    displayName: 'Composure',
    category: 'MENTAL',
    description: 'Ability to remain calm under pressure',
    displayOrder: 25,
  },
  {
    key: 'concentration',
    displayName: 'Concentration',
    category: 'MENTAL',
    description: 'Ability to maintain focus throughout the match',
    displayOrder: 26,
  },
  {
    key: 'decisions',
    displayName: 'Decisions',
    category: 'MENTAL',
    description: 'Quality of decision-making on and off the ball',
    displayOrder: 27,
  },
  {
    key: 'positioning',
    displayName: 'Positioning',
    category: 'MENTAL',
    description: 'Understanding of positional play',
    displayOrder: 28,
  },
  {
    key: 'off_the_ball',
    displayName: 'Off the Ball',
    category: 'MENTAL',
    description: 'Movement and positioning when not in possession',
    displayOrder: 29,
  },
  {
    key: 'anticipation',
    displayName: 'Anticipation',
    category: 'MENTAL',
    description: 'Ability to predict play and react early',
    displayOrder: 30,
  },
  {
    key: 'flair',
    displayName: 'Flair',
    category: 'MENTAL',
    description: 'Tendency to attempt creative and unexpected moves',
    displayOrder: 31,
  },
  {
    key: 'leadership',
    displayName: 'Leadership',
    category: 'MENTAL',
    description: 'Ability to lead and motivate teammates',
    displayOrder: 32,
  },
  {
    key: 'teamwork',
    displayName: 'Teamwork',
    category: 'MENTAL',
    description: 'Willingness to work for the team',
    displayOrder: 33,
  },

  // ============================================
  // ATTITUDE METRICS (Coach-only)
  // ============================================
  {
    key: 'work_rate',
    displayName: 'Work Rate',
    category: 'ATTITUDE',
    description: 'Effort and commitment in training and matches',
    isCoachOnly: true,
    displayOrder: 34,
  },
  {
    key: 'determination',
    displayName: 'Determination',
    category: 'ATTITUDE',
    description: 'Drive to succeed and overcome challenges',
    isCoachOnly: true,
    displayOrder: 35,
  },
  {
    key: 'ambition',
    displayName: 'Ambition',
    category: 'ATTITUDE',
    description: 'Desire to reach the highest level',
    isCoachOnly: true,
    displayOrder: 36,
  },
  {
    key: 'professionalism',
    displayName: 'Professionalism',
    category: 'ATTITUDE',
    description: 'Professional conduct and attitude',
    isCoachOnly: true,
    displayOrder: 37,
  },
  {
    key: 'consistency',
    displayName: 'Consistency',
    category: 'ATTITUDE',
    description: 'Ability to perform at a consistent level',
    isCoachOnly: true,
    displayOrder: 38,
  },
  {
    key: 'adaptability',
    displayName: 'Adaptability',
    category: 'ATTITUDE',
    description: 'Ability to adapt to different situations and roles',
    isCoachOnly: true,
    displayOrder: 39,
  },
  {
    key: 'pressure_handling',
    displayName: 'Pressure Handling',
    category: 'ATTITUDE',
    description: 'Ability to perform under pressure',
    isCoachOnly: true,
    displayOrder: 40,
  },
  {
    key: 'coachability',
    displayName: 'Coachability',
    category: 'ATTITUDE',
    description: 'Willingness to learn and accept feedback',
    isCoachOnly: true,
    displayOrder: 41,
  },

  // ============================================
  // GOALKEEPING METRICS
  // ============================================
  {
    key: 'handling',
    displayName: 'Handling',
    category: 'GOALKEEPING',
    description: 'Ability to catch and hold shots',
    displayOrder: 42,
  },
  {
    key: 'reflexes',
    displayName: 'Reflexes',
    category: 'GOALKEEPING',
    description: 'Reaction speed to shots and deflections',
    displayOrder: 43,
  },
  {
    key: 'one_on_ones',
    displayName: 'One on Ones',
    category: 'GOALKEEPING',
    description: 'Ability to handle one-on-one situations',
    displayOrder: 44,
  },
  {
    key: 'command_of_area',
    displayName: 'Command of Area',
    category: 'GOALKEEPING',
    description: 'Ability to organize and control the penalty area',
    displayOrder: 45,
  },
  {
    key: 'communication',
    displayName: 'Communication',
    category: 'GOALKEEPING',
    description: 'Ability to communicate with defenders',
    displayOrder: 46,
  },
  {
    key: 'kicking',
    displayName: 'Kicking',
    category: 'GOALKEEPING',
    description: 'Quality of goal kicks and distribution',
    displayOrder: 47,
  },
  {
    key: 'throwing',
    displayName: 'Throwing',
    category: 'GOALKEEPING',
    description: 'Accuracy and distance of throws',
    displayOrder: 48,
  },
  {
    key: 'aerial_ability',
    displayName: 'Aerial Ability',
    category: 'GOALKEEPING',
    description: 'Ability to claim crosses and high balls',
    displayOrder: 49,
  },
];

async function main() {
  console.log('🌱 Seeding Player Metric Definitions...');

  for (const metric of metrics) {
    await prisma.playerMetricDefinition.upsert({
      where: { key: metric.key },
      update: {
        displayName: metric.displayName,
        category: metric.category,
        description: metric.description,
        minValue: metric.minValue ?? 0,
        maxValue: metric.maxValue ?? 100,
        isCoachOnly: metric.isCoachOnly ?? false,
        displayOrder: metric.displayOrder,
        isActive: true,
      },
      create: {
        key: metric.key,
        displayName: metric.displayName,
        category: metric.category,
        description: metric.description,
        minValue: metric.minValue ?? 0,
        maxValue: metric.maxValue ?? 100,
        isCoachOnly: metric.isCoachOnly ?? false,
        displayOrder: metric.displayOrder,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${metrics.length} metric definitions`);
  console.log(`   - Technical: ${metrics.filter(m => m.category === 'TECHNICAL').length}`);
  console.log(`   - Physical: ${metrics.filter(m => m.category === 'PHYSICAL').length}`);
  console.log(`   - Mental: ${metrics.filter(m => m.category === 'MENTAL').length}`);
  console.log(`   - Attitude: ${metrics.filter(m => m.category === 'ATTITUDE').length}`);
  console.log(`   - Goalkeeping: ${metrics.filter(m => m.category === 'GOALKEEPING').length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding metrics:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



