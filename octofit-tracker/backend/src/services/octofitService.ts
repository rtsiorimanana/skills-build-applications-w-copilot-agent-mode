import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity input is required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string'
    || !mongoose.isValidObjectId(userId)
    || typeof teamId !== 'string'
    || !mongoose.isValidObjectId(teamId)
    || typeof type !== 'string'
    || type.trim().length === 0
    || typeof minutes !== 'number'
    || !Number.isFinite(minutes)
    || minutes <= 0
  ) {
    throw Object.assign(new Error('Activity requires valid userId, teamId, type, and minutes'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id'),
    Team.findById(teamId).select('_id'),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user and team must exist'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  if (!_input || typeof _input !== 'object') {
    throw Object.assign(new Error('Team input is required'), { status: 400 });
  }

  const { name, mascot, members = [] } = _input as Record<string, unknown>;
  if (
    typeof name !== 'string'
    || name.trim().length === 0
    || typeof mascot !== 'string'
    || mascot.trim().length === 0
    || !Array.isArray(members)
    || members.some((member) => typeof member !== 'string' || !mongoose.isValidObjectId(member))
  ) {
    throw Object.assign(new Error('Team requires a name, mascot, and valid members'), { status: 400 });
  }

  const memberIds = members as string[];
  const memberCount = await User.countDocuments({ _id: { $in: memberIds } });
  if (memberCount !== new Set(memberIds).size) {
    throw Object.assign(new Error('Team members must exist'), { status: 404 });
  }

  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
  await User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } });
  return team;
}

export async function getLeaderboard() {
  const entries = await Activity.aggregate<{
    _id: mongoose.Types.ObjectId;
    totalPoints: number;
    team: { name: string };
  }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1 } },
  ]);
  return entries.map((entry, index) => ({
    teamName: entry.team.name,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.toLowerCase() }).select('_id fitnessGoal');
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).select('type'),
    Workout.find().lean(),
  ]);
  const preferredFocus = user.fitnessGoal.toLowerCase();
  const recentType = recentActivity?.type.toLowerCase();
  return workouts
    .map((workout) => ({
      ...workout,
      reason: workout.focus.toLowerCase() === preferredFocus
        ? `Matches the user's ${user.fitnessGoal} fitness goal.`
        : workout.focus.toLowerCase() === recentType
          ? `Builds on the user's recent ${recentType} activity.`
          : `Supports the user's recent activity.`,
      priority: workout.focus.toLowerCase() === preferredFocus
        ? 2
        : workout.focus.toLowerCase() === recentType ? 1 : 0,
    }))
    .sort((left, right) => right.priority - left.priority)
    .map(({ priority: _priority, ...workout }) => workout);
}

export { User };
