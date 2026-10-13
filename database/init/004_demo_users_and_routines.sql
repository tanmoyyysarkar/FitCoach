BEGIN;

-- Development-only demo accounts. Password for both accounts: 000000
INSERT INTO users (name, email, password_hash, role, date_of_birth, gender)
VALUES
  ('FitCoach Trainer', 'trainer@fitcoach.local', '$2b$10$PqxZZnz/Ewpf/AFMSD0rLe1Mo4sQq/hQ62Hl7pw7E0H62rFG1Zsn6', 'trainer', '1985-01-01', 'male'),
  ('TunaMayo', 'tuna@gmail.com', '$2b$10$PqxZZnz/Ewpf/AFMSD0rLe1Mo4sQq/hQ62Hl7pw7E0H62rFG1Zsn6', 'client', '2000-01-01', 'male')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender;

DO $$
DECLARE
  demo_trainer_id BIGINT;
  demo_client_id BIGINT;
  existing_workout_id BIGINT;
  workout_id BIGINT;
  demo_workout_exercise_id BIGINT;
  exercise_data JSONB;
  set_data JSONB;
  exercise_index INTEGER;
  set_index INTEGER;
BEGIN
  SELECT user_id INTO demo_trainer_id FROM users WHERE email = 'trainer@fitcoach.local';
  SELECT user_id INTO demo_client_id FROM users WHERE email = 'tuna@gmail.com';

  INSERT INTO coach_clients (trainer_id, client_id, status, start_date)
  VALUES (demo_trainer_id, demo_client_id, 'active', CURRENT_DATE)
  ON CONFLICT (trainer_id, client_id) DO UPDATE
  SET status = 'active', start_date = COALESCE(coach_clients.start_date, EXCLUDED.start_date), end_date = NULL;

  FOR existing_workout_id IN
    SELECT w.workout_id
    FROM workouts w
    WHERE w.created_by = demo_trainer_id
      AND w.name IN ('Leg Workout', 'Push Workout', 'Pull Workout')
  LOOP
    DELETE FROM workout_assignments wa
    WHERE wa.workout_id = existing_workout_id
      AND wa.client_id = demo_client_id;
    DELETE FROM workouts w WHERE w.workout_id = existing_workout_id;
  END LOOP;

  -- Leg Workout
  INSERT INTO workouts (created_by, name, description)
  VALUES (demo_trainer_id, 'Leg Workout', 'Lower-body strength and volume with calves and core work.')
  RETURNING workouts.workout_id INTO workout_id;
  FOR exercise_data, exercise_index IN
    SELECT value, ordinality::INTEGER
    FROM jsonb_array_elements('[
      {"exerciseId":"jFtipLl","sets":[{"weight":40,"reps":6},{"weight":40,"reps":12},{"weight":45,"reps":12}]},
      {"exerciseId":"7zdxRTl","sets":[{"weight":65,"reps":10},{"weight":65,"reps":10}]},
      {"exerciseId":"my33uHU","sets":[{"weight":40,"reps":12},{"weight":40,"reps":12}]},
      {"exerciseId":"17lJ1kr","sets":[{"weight":20,"reps":12},{"weight":20,"reps":9}]},
      {"exerciseId":"6MaEjVA","sets":[{"weight":65,"reps":20},{"weight":65,"reps":20}]},
      {"exerciseId":"IeDEXTe","sets":[{"weight":30,"reps":15},{"weight":30,"reps":20}]},
      {"exerciseId":"8gQo5Ss","sets":[{"weight":35,"reps":15},{"weight":35,"reps":20}]}
    ]'::JSONB) WITH ORDINALITY
  LOOP
    INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order, target_sets, target_reps, target_weight)
    SELECT workout_id, exercise_data->>'exerciseId', exercise_index,
           jsonb_array_length(exercise_data->'sets'),
           (exercise_data->'sets'->0->>'reps')::INTEGER,
           NULLIF(exercise_data->'sets'->0->>'weight', '')::NUMERIC
    RETURNING workout_exercise_id INTO demo_workout_exercise_id;
    FOR set_data, set_index IN
      SELECT value, ordinality::INTEGER FROM jsonb_array_elements(exercise_data->'sets') WITH ORDINALITY
    LOOP
      INSERT INTO workout_exercise_sets (workout_exercise_id, set_number, reps, weight)
      VALUES (demo_workout_exercise_id, set_index, (set_data->>'reps')::INTEGER, NULLIF(set_data->>'weight', '')::NUMERIC);
    END LOOP;
  END LOOP;
  INSERT INTO workout_assignments (workout_id, client_id, assigned_by) VALUES (workout_id, demo_client_id, demo_trainer_id);

  -- Push Workout
  INSERT INTO workouts (created_by, name, description)
  VALUES (demo_trainer_id, 'Push Workout', 'Chest, shoulders, arms, and triceps with pressing and cable work.')
  RETURNING workouts.workout_id INTO workout_id;
  FOR exercise_data, exercise_index IN
    SELECT value, ordinality::INTEGER FROM jsonb_array_elements('[
      {"exerciseId":"I4hDWkc","sets":[{"reps":14},{"reps":11}]},
      {"exerciseId":"5v7KYld","sets":[{"weight":45,"reps":2},{"weight":40,"reps":3},{"weight":40,"reps":6}]},
      {"exerciseId":"0CXGHya","sets":[{"weight":10,"reps":20},{"weight":15,"reps":8}]},
      {"exerciseId":"FVmZVhk","sets":[{"weight":10,"reps":8},{"weight":5,"reps":14},{"weight":10,"reps":20}]},
      {"exerciseId":"DOoWcnA","sets":[{"weight":30,"reps":8},{"weight":30,"reps":7}]},
      {"exerciseId":"qOgPVf6","sets":[{"weight":15,"reps":8},{"weight":10,"reps":8},{"weight":5,"reps":10},{"weight":15,"reps":6},{"weight":10,"reps":8},{"weight":5,"reps":15}]},
      {"exerciseId":"slDvUAU","sets":[{"weight":7.5,"reps":11},{"weight":7.5,"reps":10}]},
      {"exerciseId":"gAwDzB3","sets":[{"weight":25,"reps":11},{"weight":25,"reps":11}]},
      {"exerciseId":"2IxROQ1","sets":[{"weight":30,"reps":15},{"weight":35,"reps":7}]}
    ]'::JSONB) WITH ORDINALITY
  LOOP
    INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order, target_sets, target_reps, target_weight)
    SELECT workout_id, exercise_data->>'exerciseId', exercise_index, jsonb_array_length(exercise_data->'sets'),
           (exercise_data->'sets'->0->>'reps')::INTEGER, NULLIF(exercise_data->'sets'->0->>'weight', '')::NUMERIC
    RETURNING workout_exercise_id INTO demo_workout_exercise_id;
    FOR set_data, set_index IN SELECT value, ordinality::INTEGER FROM jsonb_array_elements(exercise_data->'sets') WITH ORDINALITY LOOP
      INSERT INTO workout_exercise_sets (workout_exercise_id, set_number, reps, weight)
      VALUES (demo_workout_exercise_id, set_index, (set_data->>'reps')::INTEGER, NULLIF(set_data->>'weight', '')::NUMERIC);
    END LOOP;
  END LOOP;
  INSERT INTO workout_assignments (workout_id, client_id, assigned_by) VALUES (workout_id, demo_client_id, demo_trainer_id);

  -- Pull Workout
  INSERT INTO workouts (created_by, name, description)
  VALUES (demo_trainer_id, 'Pull Workout', 'Back, shoulders, traps, forearms, and lower-back accessory work.')
  RETURNING workouts.workout_id INTO workout_id;
  FOR exercise_data, exercise_index IN
    SELECT value, ordinality::INTEGER FROM jsonb_array_elements('[
      {"exerciseId":"LEprlgG","sets":[{"weight":30,"reps":10},{"weight":30,"reps":10},{"weight":30,"reps":10}]},
      {"exerciseId":"EIsE3u8","sets":[{"weight":30,"reps":12},{"weight":30,"reps":10}]},
      {"exerciseId":"fUBheHs","sets":[{"weight":30,"reps":12},{"weight":30,"reps":8},{"weight":25,"reps":10}]},
      {"exerciseId":"903mzG8","sets":[{"weight":40,"reps":10},{"weight":40,"reps":9}]},
      {"exerciseId":"goJ6ezq","sets":[{"weight":10,"reps":12},{"weight":10,"reps":10}]},
      {"exerciseId":"MzNnwx9","sets":[{"weight":50,"reps":20},{"weight":50,"reps":20}]},
      {"exerciseId":"myfUsKf","sets":[{"weight":30,"reps":12},{"weight":30,"reps":10}]},
      {"exerciseId":"B6dAO1t","sets":[{"weight":15,"reps":20},{"weight":15,"reps":20}]},
      {"exerciseId":"rUXfn3R","sets":[{"weight":15,"reps":10},{"weight":15,"reps":15}]}
    ]'::JSONB) WITH ORDINALITY
  LOOP
    INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order, target_sets, target_reps, target_weight)
    SELECT workout_id, exercise_data->>'exerciseId', exercise_index, jsonb_array_length(exercise_data->'sets'),
           (exercise_data->'sets'->0->>'reps')::INTEGER, NULLIF(exercise_data->'sets'->0->>'weight', '')::NUMERIC
    RETURNING workout_exercise_id INTO demo_workout_exercise_id;
    FOR set_data, set_index IN SELECT value, ordinality::INTEGER FROM jsonb_array_elements(exercise_data->'sets') WITH ORDINALITY LOOP
      INSERT INTO workout_exercise_sets (workout_exercise_id, set_number, reps, weight)
      VALUES (demo_workout_exercise_id, set_index, (set_data->>'reps')::INTEGER, NULLIF(set_data->>'weight', '')::NUMERIC);
    END LOOP;
  END LOOP;
  INSERT INTO workout_assignments (workout_id, client_id, assigned_by) VALUES (workout_id, demo_client_id, demo_trainer_id);
END $$;

COMMIT;
