/**
 * Coach Calibration API Routes
 */

import { Router } from 'express';
import { authRequired, requireRole } from '../../auth/auth.middleware';
import {
  getCoachScoringProfile,
  getAllCoachProfiles,
  getContextualAverages,
  getCalibrationHints,
  computeCoachScoringProfile,
  getPlayerConsensus,
  getMultiCoachPlayers,
} from './calibration.service';

const router = Router();

// Get coach's own scoring profile
router.get('/profile/:coachId', authRequired, requireRole('COACH', 'ADMIN'), async (req, res) => {
  try {
    const { coachId } = req.params;
    const { id: userId, role } = req.user!;

    // Coaches can only see their own profile unless admin
    if (role !== 'ADMIN' && parseInt(coachId) !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const forceRefresh = req.query.refresh === 'true';
    const profile = await getCoachScoringProfile(parseInt(coachId), forceRefresh);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Create some snapshots first.' });
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all coach profiles (admin only)
router.get('/profiles/all', authRequired, requireRole('ADMIN'), async (req, res) => {
  try {
    const profiles = await getAllCoachProfiles();
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get contextual averages for a metric
router.get('/averages/:metricKey', authRequired, requireRole('COACH', 'ADMIN'), async (req, res) => {
  try {
    const { metricKey } = req.params;
    const { centerId, position, ageGroup, seasonId } = req.query;

    const averages = await getContextualAverages(metricKey, {
      centerId: centerId ? parseInt(centerId as string) : undefined,
      position: position as any,
      ageGroup: ageGroup as string,
      seasonId: seasonId as string,
    });

    res.json(averages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get calibration hints for a metric value
router.post('/hints', authRequired, requireRole('COACH', 'ADMIN'), async (req, res) => {
  try {
    const { metricKey, value, studentId, centerId, position, ageGroup } = req.body;

    if (!metricKey || value === undefined) {
      return res.status(400).json({ message: 'metricKey and value are required' });
    }

    const hint = await getCalibrationHints(metricKey, value, {
      studentId,
      centerId,
      position,
      ageGroup,
    });

    res.json(hint);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Force refresh coach profile (admin or self)
router.post('/profile/:coachId/refresh', authRequired, requireRole('COACH', 'ADMIN'), async (req, res) => {
  try {
    const { coachId } = req.params;
    const { id: userId, role } = req.user!;

    if (role !== 'ADMIN' && parseInt(coachId) !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const profile = await computeCoachScoringProfile(parseInt(coachId));
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get multi-coach consensus for a player (admin only)
router.get('/consensus/player/:studentId', authRequired, requireRole('ADMIN'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { anonymize } = req.query;

    const consensus = await getPlayerConsensus(parseInt(studentId), {
      anonymize: anonymize !== 'false', // Default to true
    });

    if (!consensus) {
      return res.status(404).json({ message: 'No consensus data found for this player' });
    }

    res.json(consensus);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all players with multi-coach ratings (admin only)
router.get('/consensus/players', authRequired, requireRole('ADMIN'), async (req, res) => {
  try {
    const { minCoaches, anonymize } = req.query;

    const players = await getMultiCoachPlayers({
      minCoaches: minCoaches ? parseInt(minCoaches as string) : 2,
      anonymize: anonymize !== 'false',
    });

    res.json({ players });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

