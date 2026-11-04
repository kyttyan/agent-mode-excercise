import { isValidObjectId } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw badRequest('Activity payload is required.');
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: string;
    teamId?: string;
    type?: string;
    minutes?: number;
  };

  if (!userId || !teamId || !type || typeof minutes !== 'number') {
    throw badRequest('userId, teamId, type, and minutes are required.');
  }

  if (!isValidObjectId(userId) || !isValidObjectId(teamId)) {
    throw badRequest('userId and teamId must be valid ObjectIds.');
  }

  const [user, team] = await Promise.all([
    User.findById(userId),
    Team.findById(teamId),
  ]);

  if (!user || !team) {
    throw badRequest('Activity references must point to an existing user and team.');
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
