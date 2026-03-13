-- Supabase/Postgres Schema for Next-Gen LMS

-- Enable RLS later for security
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

-- Users (Native auth: phone + password)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,  -- E.164 format e.g. +1234567890
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'instructor', 'admin')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for phone lookup
CREATE INDEX idx_users_phone ON users(phone);


-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id),
  google_drive_folder_id TEXT,  -- Drive folder for videos
  price DECIMAL(10,2) DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, course_id)
);

-- Lessons (videos)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  google_drive_file_id TEXT NOT NULL,  -- For proxy streaming
  duration INTEGER,  -- seconds
  completed_by JSONB DEFAULT '{}'::JSONB  -- {user_id: completed_at}
);

-- Progress
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5,2)  -- for quizzes
);

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  questions JSONB NOT NULL  -- [{question, options, correct}]
);

-- Leaderboards (Redis primary, this for persistence)
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id),
  user_id UUID REFERENCES users(id),
  points INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificates (on-chain tx hash)
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  blockchain_tx_hash TEXT,
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Indexes for perf
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_progress_enrollment ON progress(enrollment_id);
CREATE INDEX idx_leaderboards_course ON leaderboards(course_id);
