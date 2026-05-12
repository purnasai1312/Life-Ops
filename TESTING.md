# LifeOps Testing Checklist

Use a fresh test user when possible. For production-like testing, run the current Supabase migration first.

## Automated Tests
- Run `npm test -- --runInBand`.
- For local development watch mode, run `npm run test:watch`.
- Current automated suite covers 13 test files and 50 test cases.
- Confirm calculation helper tests pass for calorie/protein percentage clamping.
- Confirm habit completion percentage and streak tests pass.
- Confirm dashboard zero-state tests pass.
- Confirm vegan/vegetarian suggestion filtering tests pass.
- Confirm workout suggestion filtering tests pass.
- Confirm goal unit mapping tests pass.
- Confirm auth routing decision tests pass.
- Confirm onboarding validation and Supabase payload mapping tests pass.
- Confirm meal/workout/reflection/activity/profile payload mapping tests pass.
- Confirm data-integrity tests pass for authenticated user payloads and no fake dashboard randomness.

## Auth
- Fresh install or cleared storage opens the login/signup screen, not onboarding.
- Sign up with a new email and password.
- Sign out, then sign in with the same account.
- Confirm logout returns to the auth screen.
- Close and reopen the app; confirm the session persists.
- Try logout after clearing/expiring the session; confirm no crash.
- Try Google OAuth cancel/failure paths; confirm a clean error.
- On iOS, try Apple Sign-In cancel/failure paths; confirm a clean error.

## Onboarding
- New user without completed onboarding routes to onboarding after signup.
- Existing user with completed onboarding routes to Today.
- Save name, age, height, weight, goal, diet, workout preferences, targets, and selected goals.
- Confirm onboarding values appear in Profile.
- Leave a required field blank; confirm validation appears and the app does not crash.
- Select multiple workout preferences and habit priorities; confirm they persist after app restart.
- Select onboarding goals; confirm matching goal rows are created.

## Profile
- Edit name, age, height, weight, goal, activity level, diet preference, workout preferences, and targets.
- Save, leave the screen, return, and confirm values persisted.
- Confirm changes affect meal/workout suggestions and Today targets.
- Confirm developer reset/logout controls only appear in development builds.

## Meals
- Add a meal manually.
- Edit calories, protein, carbs, fat, notes, and meal type.
- Delete a meal.
- Confirm Today dashboard calories/protein update from the logged meal.

## Meal Suggestions
- Set diet to vegan; confirm suggestions contain no meat, fish, eggs, dairy, whey, or animal products.
- Set diet to vegetarian; confirm suggestions contain no meat or fish.
- Set goal to lose weight, gain muscle, maintain, and feel healthier; confirm suggestions shift appropriately.
- Quick-add a suggested meal and confirm it appears in Today.

## Workouts
- Add a workout manually.
- Edit type, duration, exercise, sets, reps, weight, and notes.
- Delete a workout.
- Confirm Today dashboard workout status updates.

## Workout Suggestions
- Change goal, workout preferences, and experience level.
- Confirm suggested workouts filter by those values.
- Quick-add a suggested workout and confirm it appears in Today.

## Habits
- Create a habit.
- Mark a habit complete.
- Unmark the same habit.
- Confirm habit counts and streak behavior update.
- Delete a habit.
- Restart the app and confirm habit state is restored from Supabase.

## Reflect
- Log a check-in.
- Confirm the Reflect screen shows today’s entry.
- Confirm Today dashboard reflect status updates.
- Confirm 7-day and 30-day history views load previous check-ins.

## Goals
- Add a goal with category and unit.
- Log progress.
- Edit/update a goal if available in the current build.
- Delete a goal.
- Confirm Today dashboard goal progress uses real goal data.
- Confirm category icons are minimal outline icons, not emoji.
- Confirm no irrelevant default goals appear for a new user.

## Activity And Health Sync
- Open Activity.
- If health sync is unavailable, confirm the app says manual activity can still be added.
- Add manual steps, calories burned, active minutes, exercise minutes, distance, and workouts count.
- Confirm the Activity Today card updates.
- Confirm Today dashboard steps, calories burned, workout status, and weekly activity trend update.

## History
- Add entries across multiple dates using Supabase test data or manual app flows.
- Confirm Meals History shows Last 7 days and Last 30 days.
- Confirm Workouts History shows Last 7 days and Last 30 days.
- Confirm Habits and Reflect history views still load without fake data.
- Confirm Activity history shows Today, Last 7 days, and Last 30 days.

## Data Integrity
- Create a brand-new user.
- Confirm there are no random percentages, mock scores, or demo entries.
- Confirm empty states appear where no user data exists.
- Confirm all user-owned records belong to the authenticated Supabase user.
- Confirm Supabase URL and anon key are read from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Confirm no FastShot imports, URLs, or environment variables remain.
