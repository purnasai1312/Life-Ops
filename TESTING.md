# LifeOps Testing Checklist

Use a fresh test user when possible. For production-like testing, run the current Supabase migration first.

## Auth
- Sign up with a new email and password.
- Sign out, then sign in with the same account.
- Confirm logout returns to the auth screen.
- Close and reopen the app; confirm the session persists.

## Onboarding
- New user without completed onboarding routes to onboarding after signup.
- Existing user with completed onboarding routes to Today.
- Save name, age, height, weight, goal, diet, workout preferences, targets, and selected goals.
- Confirm onboarding values appear in Profile.

## Profile
- Edit name, age, height, weight, goal, activity level, diet preference, workout preferences, and targets.
- Save, leave the screen, return, and confirm values persisted.

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
- Mark a habit complete.
- Unmark the same habit.
- Confirm habit counts and streak behavior update.

## Reflect
- Log a check-in.
- Confirm the Reflect screen shows today’s entry.
- Confirm Today dashboard reflect status updates.

## Goals
- Add a goal with category and unit.
- Log progress.
- Delete a goal.
- Confirm Today dashboard goal progress uses real goal data.

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

## Data Integrity
- Create a brand-new user.
- Confirm there are no random percentages, mock scores, or demo entries.
- Confirm empty states appear where no user data exists.
- Confirm all user-owned records belong to the authenticated Supabase user.
