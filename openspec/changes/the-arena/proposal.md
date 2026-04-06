## Why

Users can currently build and test decks, but they have no way to track their actual performance in real games. The "Arena" phase is needed to implement match tracking and analytics. This will allow users to log their match results, analyze their win rates against specific matchups, and iterate on their deck versions using data-driven insights.

## What Changes

- Add a Match Database schema in Supabase for tracking match history (wins, losses, opponent decks, going first/second) linked to specific deck versions.
- Implement "The Match Logger", a quick-entry UI that allows users to rapidly record their match results (e.g., "I just won against Snake-Eyes").
- Build the Arena Dashboard to display performance metrics, win rate charts, and matchup spreads for specific decks and versions.
- Create a "Meta-Report" feature that aggregates match data across versions to highlight broader meta trends.

## Capabilities

### New Capabilities

- `match-tracking`: Tracking individual game results (wins/losses/draws), opponent decks, and match details, linked to specific deck versions.
- `arena-dashboard`: Visualizing performance data through win rate charts, matchup spreads, and aggregated meta reports.

### Modified Capabilities

None.

## Impact

- **Database**: New tables/relations in Supabase for matches and opponents, linked to existing deck versions.
- **UI**: New routes for the Arena dashboard and Match Logger.
- **State Management**: Updating the Zustand store or server actions to handle match logging and analytics data fetching.
