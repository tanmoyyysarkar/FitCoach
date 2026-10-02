ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS name VARCHAR(150);

UPDATE sessions
SET name = 'Workout session'
WHERE name IS NULL;

ALTER TABLE sessions
    ALTER COLUMN name SET NOT NULL;

CREATE SEQUENCE IF NOT EXISTS session_exercises_session_exercise_id_seq;

ALTER TABLE session_exercises
    ALTER COLUMN session_exercise_id SET DEFAULT nextval('session_exercises_session_exercise_id_seq');

SELECT setval(
    'session_exercises_session_exercise_id_seq',
    COALESCE((SELECT MAX(session_exercise_id) FROM session_exercises), 0) + 1,
    false
);
