# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep the React app thin and route-driven; use the shared API client for every `/api` request and keep all loading, empty, and error states accessible to screen readers.
- Logic tier decision: Keep Express routes lean and move validation, aggregation, and recommendation logic into service functions so HTTP concerns stay separate from business rules.
- Data tier decision: Use Mongoose models for `User`, `Team`, `Activity`, and `Workout`, enforce required fields and relationship integrity, and seed realistic records that match the contract.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`; validate ObjectId references and existing records; reject malformed input with a deliberate 4xx; and store `user`, `team`, `type`, `minutes`, computed `points`, and `occurredAt`.
- Team management approach: Require a non-empty team `name`, accept `mascot` and `members`, and persist member references so team listings expose the seeded member IDs as expected.
- Leaderboard approach: Aggregate points by team, sort totals descending, and assign 1-based ranks while returning `teamName`, `totalPoints`, and `rank` in the API response.
- Workout suggestions approach: Resolve the target user by email, compare their recent activity or fitness goal to workout focus areas, and return the top recommendation with a reason that explains the match.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Fails when the schema, seeds, or validation logic do not match the required data contract.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Fails when `/api/*` routes reject valid input, return 500s from bad casts, or return the wrong leaderboard and workout recommendation behavior.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Fails when the app still renders placeholder text instead of data, or when loading/empty/error states are not accessible and visible to the tests.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Fails on TypeScript or Express configuration issues after the service and routing logic are implemented.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Fails on Vite, React, or type-checking regressions once the UI is wired to the API contract.
- Baseline execution: `npm test --prefix octofit-tracker/backend` and `npm test --prefix octofit-tracker/frontend`
  - Current failures indicate the project is still in the starter “implementation pending” state: the API contract is not complete and the frontend is not yet rendering real data or accessible states.
