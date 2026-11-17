import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Suggestion = { title: string; reason: string };
type SuggestionsResponse = { suggestions: Suggestion[] };
const loadWorkouts = () => getJson<SuggestionsResponse>('/api/workouts/suggestions/mona@example.com');

export default function Workouts() {
  return <CapabilityCard<SuggestionsResponse>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    loadData={loadWorkouts}
    emptyMessage="No workout suggestions yet."
    isEmpty={(data) => data.suggestions.length === 0}
    renderData={(data) => <ul>{data.suggestions.map((suggestion) => <li key={suggestion.title}>{suggestion.title}: {suggestion.reason}</li>)}</ul>}
  />;
}
