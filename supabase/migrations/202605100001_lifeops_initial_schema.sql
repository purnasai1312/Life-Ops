-- LifeOps initial Supabase schema
-- Run this in a new Supabase project after Auth is enabled.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  age integer check (age is null or age between 0 and 130),
  height text,
  weight text,
  goal text,
  activity_level text,
  diet_preference text,
  workout_preference text,
  habits text[] not null default '{}',
  intentions text[] not null default '{}',
  focus_statement text,
  has_completed_onboarding boolean not null default false,
  notifications_enabled boolean not null default true,
  week_starts_on_monday boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  age integer check (age is null or age between 0 and 130),
  height text,
  weight text,
  goal text,
  activity_level text,
  diet_preference text,
  workout_preference text,
  habits text[] not null default '{}',
  intentions text[] not null default '{}',
  focus_statement text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  note text,
  task_date date not null default current_date,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text,
  target integer not null default 1 check (target > 0),
  progress integer not null default 0 check (progress >= 0),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_progress_not_above_target check (progress <= target)
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  meal_date date not null default current_date,
  calories numeric(8,2) check (calories is null or calories >= 0),
  protein_g numeric(8,2) check (protein_g is null or protein_g >= 0),
  carbs_g numeric(8,2) check (carbs_g is null or carbs_g >= 0),
  fat_g numeric(8,2) check (fat_g is null or fat_g >= 0),
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id uuid,
  food_name text not null,
  quantity numeric(10,2),
  unit text,
  calories numeric(8,2) check (calories is null or calories >= 0),
  protein_g numeric(8,2) check (protein_g is null or protein_g >= 0),
  carbs_g numeric(8,2) check (carbs_g is null or carbs_g >= 0),
  fat_g numeric(8,2) check (fat_g is null or fat_g >= 0),
  consumed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (meal_id, user_id) references public.meals(id, user_id) on delete cascade
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  workout_type text,
  scheduled_for date,
  started_at timestamptz,
  completed_at timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.workout_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid,
  exercise_name text not null,
  sets integer check (sets is null or sets >= 0),
  reps integer check (reps is null or reps >= 0),
  weight numeric(8,2) check (weight is null or weight >= 0),
  distance numeric(10,2) check (distance is null or distance >= 0),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  notes text,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workout_id, user_id) references public.workouts(id, user_id) on delete cascade
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  icon text,
  color text,
  cadence text not null default 'daily' check (cadence in ('daily', 'weekdays', 'weekly')),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null,
  log_date date not null default current_date,
  completed boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, log_date),
  foreign key (habit_id, user_id) references public.habits(id, user_id) on delete cascade
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reflection_date date not null default current_date,
  mood_value integer check (mood_value between 1 and 5),
  note text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reflection_date)
);

create table if not exists public.daily_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score_date date not null default current_date,
  task_score numeric(5,2) not null default 0,
  habit_score numeric(5,2) not null default 0,
  mood_score numeric(5,2) not null default 0,
  meal_score numeric(5,2) not null default 0,
  workout_score numeric(5,2) not null default 0,
  total_score numeric(5,2) not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, score_date)
);

create table if not exists public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  week_end_date date not null,
  summary text,
  wins text[] not null default '{}',
  focus_next_week text,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start_date),
  constraint weekly_summaries_valid_range check (week_end_date >= week_start_date)
);

create index if not exists profiles_has_completed_onboarding_idx on public.profiles(has_completed_onboarding);
create index if not exists onboarding_user_id_idx on public.onboarding(user_id);
create index if not exists tasks_user_date_idx on public.tasks(user_id, task_date desc);
create index if not exists goals_user_due_date_idx on public.goals(user_id, due_date);
create index if not exists meals_user_date_idx on public.meals(user_id, meal_date desc);
create index if not exists meal_entries_user_consumed_at_idx on public.meal_entries(user_id, consumed_at desc);
create index if not exists meal_entries_meal_id_idx on public.meal_entries(meal_id);
create index if not exists workouts_user_scheduled_idx on public.workouts(user_id, scheduled_for desc);
create index if not exists workout_entries_user_completed_idx on public.workout_entries(user_id, completed_at desc);
create index if not exists workout_entries_workout_id_idx on public.workout_entries(workout_id);
create index if not exists habits_user_archived_idx on public.habits(user_id, is_archived);
create index if not exists habit_logs_user_date_idx on public.habit_logs(user_id, log_date desc);
create index if not exists habit_logs_habit_id_idx on public.habit_logs(habit_id);
create index if not exists reflections_user_date_idx on public.reflections(user_id, reflection_date desc);
create index if not exists daily_scores_user_date_idx on public.daily_scores(user_id, score_date desc);
create index if not exists weekly_summaries_user_week_idx on public.weekly_summaries(user_id, week_start_date desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'onboarding',
    'tasks',
    'goals',
    'meals',
    'meal_entries',
    'workouts',
    'workout_entries',
    'habits',
    'habit_logs',
    'reflections',
    'daily_scores',
    'weekly_summaries'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.onboarding enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.meals enable row level security;
alter table public.meal_entries enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_entries enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.reflections enable row level security;
alter table public.daily_scores enable row level security;
alter table public.weekly_summaries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_delete_own" on public.profiles for delete to authenticated using (id = auth.uid());

drop policy if exists "onboarding_select_own" on public.onboarding;
drop policy if exists "onboarding_insert_own" on public.onboarding;
drop policy if exists "onboarding_update_own" on public.onboarding;
drop policy if exists "onboarding_delete_own" on public.onboarding;
create policy "onboarding_select_own" on public.onboarding for select to authenticated using (user_id = auth.uid());
create policy "onboarding_insert_own" on public.onboarding for insert to authenticated with check (user_id = auth.uid());
create policy "onboarding_update_own" on public.onboarding for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "onboarding_delete_own" on public.onboarding for delete to authenticated using (user_id = auth.uid());

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_select_own" on public.tasks for select to authenticated using (user_id = auth.uid());
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check (user_id = auth.uid());
create policy "tasks_update_own" on public.tasks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks_delete_own" on public.tasks for delete to authenticated using (user_id = auth.uid());

drop policy if exists "goals_select_own" on public.goals;
drop policy if exists "goals_insert_own" on public.goals;
drop policy if exists "goals_update_own" on public.goals;
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_select_own" on public.goals for select to authenticated using (user_id = auth.uid());
create policy "goals_insert_own" on public.goals for insert to authenticated with check (user_id = auth.uid());
create policy "goals_update_own" on public.goals for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "goals_delete_own" on public.goals for delete to authenticated using (user_id = auth.uid());

drop policy if exists "meals_select_own" on public.meals;
drop policy if exists "meals_insert_own" on public.meals;
drop policy if exists "meals_update_own" on public.meals;
drop policy if exists "meals_delete_own" on public.meals;
create policy "meals_select_own" on public.meals for select to authenticated using (user_id = auth.uid());
create policy "meals_insert_own" on public.meals for insert to authenticated with check (user_id = auth.uid());
create policy "meals_update_own" on public.meals for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "meals_delete_own" on public.meals for delete to authenticated using (user_id = auth.uid());

drop policy if exists "meal_entries_select_own" on public.meal_entries;
drop policy if exists "meal_entries_insert_own" on public.meal_entries;
drop policy if exists "meal_entries_update_own" on public.meal_entries;
drop policy if exists "meal_entries_delete_own" on public.meal_entries;
create policy "meal_entries_select_own" on public.meal_entries for select to authenticated using (user_id = auth.uid());
create policy "meal_entries_insert_own" on public.meal_entries for insert to authenticated with check (user_id = auth.uid());
create policy "meal_entries_update_own" on public.meal_entries for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "meal_entries_delete_own" on public.meal_entries for delete to authenticated using (user_id = auth.uid());

drop policy if exists "workouts_select_own" on public.workouts;
drop policy if exists "workouts_insert_own" on public.workouts;
drop policy if exists "workouts_update_own" on public.workouts;
drop policy if exists "workouts_delete_own" on public.workouts;
create policy "workouts_select_own" on public.workouts for select to authenticated using (user_id = auth.uid());
create policy "workouts_insert_own" on public.workouts for insert to authenticated with check (user_id = auth.uid());
create policy "workouts_update_own" on public.workouts for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "workouts_delete_own" on public.workouts for delete to authenticated using (user_id = auth.uid());

drop policy if exists "workout_entries_select_own" on public.workout_entries;
drop policy if exists "workout_entries_insert_own" on public.workout_entries;
drop policy if exists "workout_entries_update_own" on public.workout_entries;
drop policy if exists "workout_entries_delete_own" on public.workout_entries;
create policy "workout_entries_select_own" on public.workout_entries for select to authenticated using (user_id = auth.uid());
create policy "workout_entries_insert_own" on public.workout_entries for insert to authenticated with check (user_id = auth.uid());
create policy "workout_entries_update_own" on public.workout_entries for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "workout_entries_delete_own" on public.workout_entries for delete to authenticated using (user_id = auth.uid());

drop policy if exists "habits_select_own" on public.habits;
drop policy if exists "habits_insert_own" on public.habits;
drop policy if exists "habits_update_own" on public.habits;
drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_select_own" on public.habits for select to authenticated using (user_id = auth.uid());
create policy "habits_insert_own" on public.habits for insert to authenticated with check (user_id = auth.uid());
create policy "habits_update_own" on public.habits for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "habits_delete_own" on public.habits for delete to authenticated using (user_id = auth.uid());

drop policy if exists "habit_logs_select_own" on public.habit_logs;
drop policy if exists "habit_logs_insert_own" on public.habit_logs;
drop policy if exists "habit_logs_update_own" on public.habit_logs;
drop policy if exists "habit_logs_delete_own" on public.habit_logs;
create policy "habit_logs_select_own" on public.habit_logs for select to authenticated using (user_id = auth.uid());
create policy "habit_logs_insert_own" on public.habit_logs for insert to authenticated with check (user_id = auth.uid());
create policy "habit_logs_update_own" on public.habit_logs for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "habit_logs_delete_own" on public.habit_logs for delete to authenticated using (user_id = auth.uid());

drop policy if exists "reflections_select_own" on public.reflections;
drop policy if exists "reflections_insert_own" on public.reflections;
drop policy if exists "reflections_update_own" on public.reflections;
drop policy if exists "reflections_delete_own" on public.reflections;
create policy "reflections_select_own" on public.reflections for select to authenticated using (user_id = auth.uid());
create policy "reflections_insert_own" on public.reflections for insert to authenticated with check (user_id = auth.uid());
create policy "reflections_update_own" on public.reflections for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reflections_delete_own" on public.reflections for delete to authenticated using (user_id = auth.uid());

drop policy if exists "daily_scores_select_own" on public.daily_scores;
drop policy if exists "daily_scores_insert_own" on public.daily_scores;
drop policy if exists "daily_scores_update_own" on public.daily_scores;
drop policy if exists "daily_scores_delete_own" on public.daily_scores;
create policy "daily_scores_select_own" on public.daily_scores for select to authenticated using (user_id = auth.uid());
create policy "daily_scores_insert_own" on public.daily_scores for insert to authenticated with check (user_id = auth.uid());
create policy "daily_scores_update_own" on public.daily_scores for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "daily_scores_delete_own" on public.daily_scores for delete to authenticated using (user_id = auth.uid());

drop policy if exists "weekly_summaries_select_own" on public.weekly_summaries;
drop policy if exists "weekly_summaries_insert_own" on public.weekly_summaries;
drop policy if exists "weekly_summaries_update_own" on public.weekly_summaries;
drop policy if exists "weekly_summaries_delete_own" on public.weekly_summaries;
create policy "weekly_summaries_select_own" on public.weekly_summaries for select to authenticated using (user_id = auth.uid());
create policy "weekly_summaries_insert_own" on public.weekly_summaries for insert to authenticated with check (user_id = auth.uid());
create policy "weekly_summaries_update_own" on public.weekly_summaries for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "weekly_summaries_delete_own" on public.weekly_summaries for delete to authenticated using (user_id = auth.uid());
