-- Align LifeOps onboarding/profile preference columns with multi-select app fields.
-- Run this once on existing Supabase projects that were created before workout_preferences existed.

alter table public.profiles
  add column if not exists workout_preferences text[] not null default '{}',
  add column if not exists experience_level text,
  add column if not exists calorie_target integer check (calorie_target is null or calorie_target > 0),
  add column if not exists protein_target integer check (protein_target is null or protein_target > 0),
  add column if not exists water_target integer check (water_target is null or water_target > 0),
  add column if not exists workout_frequency_goal integer check (workout_frequency_goal is null or workout_frequency_goal >= 0),
  add column if not exists movement_goal integer check (movement_goal is null or movement_goal >= 0),
  add column if not exists habit_priorities text[] not null default '{}',
  add column if not exists selected_goals text[] not null default '{}';

alter table public.onboarding
  add column if not exists workout_preferences text[] not null default '{}',
  add column if not exists experience_level text,
  add column if not exists calorie_target integer check (calorie_target is null or calorie_target > 0),
  add column if not exists protein_target integer check (protein_target is null or protein_target > 0),
  add column if not exists water_target integer check (water_target is null or water_target > 0),
  add column if not exists workout_frequency_goal integer check (workout_frequency_goal is null or workout_frequency_goal >= 0),
  add column if not exists movement_goal integer check (movement_goal is null or movement_goal >= 0),
  add column if not exists habit_priorities text[] not null default '{}',
  add column if not exists selected_goals text[] not null default '{}';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'workout_preference'
  ) then
    execute $sql$
      update public.profiles
      set workout_preferences = array_remove(array_append(workout_preferences, workout_preference), null)
      where workout_preference is not null
        and not (workout_preference = any(workout_preferences))
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'onboarding'
      and column_name = 'workout_preference'
  ) then
    execute $sql$
      update public.onboarding
      set workout_preferences = array_remove(array_append(workout_preferences, workout_preference), null)
      where workout_preference is not null
        and not (workout_preference = any(workout_preferences))
    $sql$;
  end if;
end;
$$;

notify pgrst, 'reload schema';
