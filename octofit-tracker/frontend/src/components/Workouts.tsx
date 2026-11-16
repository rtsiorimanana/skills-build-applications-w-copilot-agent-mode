import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };
type SuggestionsResponse = { suggestions: Suggestion[] };

export default function Workouts() {
  return <CapabilityCard<SuggestionsResponse>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint="/api/workouts/suggestions/mona@example.com"
    emptyMessage="No workout suggestions yet."
    isEmpty={(data) => data.suggestions.length === 0}
    renderData={(data) => <ul>{data.suggestions.map((suggestion) => <li key={suggestion.title}>{suggestion.title}: {suggestion.reason}</li>)}</ul>}
  />;
}
