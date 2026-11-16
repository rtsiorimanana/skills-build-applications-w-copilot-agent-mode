import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardResponse>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    emptyMessage="No leaderboard scores yet."
    isEmpty={(data) => data.leaderboard.length === 0}
    renderData={(data) => <ol>{data.leaderboard.map((entry) => <li key={entry.teamName}>{entry.teamName}: {entry.totalPoints} points (rank {entry.rank})</li>)}</ol>}
  />;
}
