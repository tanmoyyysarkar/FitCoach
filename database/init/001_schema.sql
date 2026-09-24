CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('trainer', 'client', 'admin')),

    date_of_birth DATE,
    gender VARCHAR(30),
    height NUMERIC(5,2),
    refresh_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainer_profiles (
    trainer_id BIGINT PRIMARY KEY,

    bio TEXT,
    specialization VARCHAR(150),
    years_experience INTEGER,
    certification VARCHAR(255),

    CONSTRAINT fk_trainer_user
        FOREIGN KEY (trainer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coach_clients (
    coach_client_id BIGSERIAL PRIMARY KEY,

    trainer_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('pending', 'active', 'rejected', 'ended')),

    start_date DATE,
    end_date DATE,

    CONSTRAINT fk_coach
        FOREIGN KEY (trainer_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_client
        FOREIGN KEY (client_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_trainer_client
        UNIQUE (trainer_id, client_id)
);

CREATE TABLE IF NOT EXISTS muscles (
    muscle_name VARCHAR(100) NOT NULL UNIQUE PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS exercises (
    exercise_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    body_parts TEXT[] NOT NULL DEFAULT '{}',
    equipments TEXT[] NOT NULL DEFAULT '{}',
    target_muscles TEXT[] NOT NULL DEFAULT '{}',
    secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
    gif_url TEXT NOT NULL,
    instructions TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS exercise_muscles (
    exercise_id VARCHAR(50) NOT NULL,
    muscle_name VARCHAR(100) NOT NULL,

    role VARCHAR(30) NOT NULL
        CHECK (role IN ('primary', 'secondary')),

    PRIMARY KEY (exercise_id, muscle_name),

    FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE CASCADE,

    FOREIGN KEY (muscle_name)
        REFERENCES muscles(muscle_name)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workouts (
    workout_id BIGSERIAL PRIMARY KEY,

    created_by BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_exercises (
    workout_exercise_id BIGSERIAL PRIMARY KEY,

    workout_id BIGINT NOT NULL,
    exercise_id VARCHAR(50) NOT NULL,

    exercise_order INTEGER NOT NULL,

    target_sets INTEGER,
    target_reps INTEGER,
    target_weight NUMERIC(7,2),
    rest_seconds INTEGER,

    FOREIGN KEY (workout_id)
        REFERENCES workouts(workout_id)
        ON DELETE CASCADE,

    FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE RESTRICT,

    UNIQUE (workout_id, exercise_order)
);

CREATE TABLE IF NOT EXISTS workout_assignments (
    assignment_id BIGSERIAL PRIMARY KEY,

    workout_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,

    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'cancelled')),

    FOREIGN KEY (workout_id)
        REFERENCES workouts(workout_id)
        ON DELETE CASCADE,

    FOREIGN KEY (client_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (assigned_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,
    workout_id BIGINT,

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    notes TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (workout_id)
        REFERENCES workouts(workout_id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS session_exercises (
    session_exercise_id BIGINT PRIMARY KEY,

    session_id BIGINT NOT NULL,
    exercise_id VARCHAR(50) NOT NULL,

    exercise_order INTEGER NOT NULL,

    FOREIGN KEY (session_id)
        REFERENCES sessions(session_id)
        ON DELETE CASCADE,

    FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sets (
    set_id BIGSERIAL PRIMARY KEY,

    session_exercise_id BIGINT NOT NULL,

    set_number INTEGER NOT NULL,

    set_type VARCHAR(30),
    reps INTEGER,
    weight NUMERIC(7,2),
    rpe NUMERIC(3,1),
    duration_seconds INTEGER,

    notes TEXT,

    FOREIGN KEY (session_exercise_id)
        REFERENCES session_exercises(session_exercise_id)
        ON DELETE CASCADE,

    UNIQUE (session_exercise_id, set_number)
);

CREATE TABLE IF NOT EXISTS personal_records (
    pr_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,
    exercise_id VARCHAR(50) NOT NULL,

    metric_type VARCHAR(30) NOT NULL
        CHECK (metric_type IN ('max_weight', 'max_reps', 'max_volume')),

    value NUMERIC(10,2) NOT NULL,

    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    set_id BIGINT,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (exercise_id)
        REFERENCES exercises(exercise_id)
        ON DELETE CASCADE,

    FOREIGN KEY (set_id)
        REFERENCES sets(set_id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS injury_reports (
    injury_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    body_area VARCHAR(100) NOT NULL,
    severity VARCHAR(30),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    status VARCHAR(30) NOT NULL DEFAULT 'active',

    notes TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
    goal_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    type VARCHAR(100) NOT NULL,
    target_value NUMERIC(10,2),
    unit VARCHAR(30),

    start_date DATE,
    target_date DATE,

    status VARCHAR(30) NOT NULL DEFAULT 'active',

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS body_measurements (
    measurement_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    weight NUMERIC(6,2),
    body_fat_percentage NUMERIC(5,2),

    chest NUMERIC(6,2),
    waist NUMERIC(6,2),
    arm NUMERIC(6,2),
    thigh NUMERIC(6,2),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    message_id BIGSERIAL PRIMARY KEY,

    coach_client_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,

    content TEXT NOT NULL,

    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (coach_client_id)
        REFERENCES coach_clients(coach_client_id)
        ON DELETE CASCADE,

    FOREIGN KEY (sender_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
