import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };
type TeamsResponse = { teams: Team[] };

export default function Teams() {
  return <CapabilityCard<TeamsResponse>
    title="Teams"
    description="Manage teams and members."
    endpoint="/api/teams"
    emptyMessage="No teams yet."
    isEmpty={(data) => data.teams.length === 0}
    renderData={(data) => <ul>{data.teams.map((team) => <li key={team.name}>{team.name}: {team.members.length} members</li>)}</ul>}
  />;
}
