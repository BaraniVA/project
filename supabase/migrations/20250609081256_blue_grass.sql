/*
  # PayMind Database Schema

  1. New Tables
    - `screen_time_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `app_name` (text)
      - `hours` (numeric)
      - `est_value_lost` (numeric)
      - `created_at` (timestamp)

    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `cost` (numeric)
      - `usage_hours` (numeric)
      - `created_at` (timestamp)

    - `distraction_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `pickup_count` (integer)
      - `notification_count` (integer)
      - `created_at` (timestamp)

    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `target_amount` (numeric)
      - `current_saved` (numeric, default 0)
      - `estimated_days_delayed` (integer, default 0)
      - `created_at` (timestamp)

    - `focus_activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text)
      - `hours` (numeric)
      - `points` (integer)
      - `date` (date)
      - `created_at` (timestamp)

    - `attention_wallet`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users, unique)
      - `total_saved_time` (numeric, default 0)
      - `total_points` (integer, default 0)
      - `money_saved` (numeric, default 0)
      - `streak_days` (integer, default 0)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own records

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for user_id and date-based queries
*/

-- Create screen_time_entries table
CREATE TABLE IF NOT EXISTS screen_time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  app_name text NOT NULL,
  hours numeric NOT NULL CHECK (hours >= 0),
  est_value_lost numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  cost numeric NOT NULL CHECK (cost >= 0),
  usage_hours numeric NOT NULL DEFAULT 0 CHECK (usage_hours >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create distraction_logs table
CREATE TABLE IF NOT EXISTS distraction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  pickup_count integer NOT NULL DEFAULT 0 CHECK (pickup_count >= 0),
  notification_count integer NOT NULL DEFAULT 0 CHECK (notification_count >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  current_saved numeric NOT NULL DEFAULT 0 CHECK (current_saved >= 0),
  estimated_days_delayed integer NOT NULL DEFAULT 0 CHECK (estimated_days_delayed >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create focus_activities table
CREATE TABLE IF NOT EXISTS focus_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  hours numeric NOT NULL CHECK (hours >= 0),
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create attention_wallet table
CREATE TABLE IF NOT EXISTS attention_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_saved_time numeric NOT NULL DEFAULT 0 CHECK (total_saved_time >= 0),
  total_points integer NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  money_saved numeric NOT NULL DEFAULT 0 CHECK (money_saved >= 0),
  streak_days integer NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE screen_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE distraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attention_wallet ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for screen_time_entries
CREATE POLICY "Users can view own screen time entries"
  ON screen_time_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own screen time entries"
  ON screen_time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own screen time entries"
  ON screen_time_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own screen time entries"
  ON screen_time_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for distraction_logs
CREATE POLICY "Users can view own distraction logs"
  ON distraction_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own distraction logs"
  ON distraction_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own distraction logs"
  ON distraction_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own distraction logs"
  ON distraction_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for goals
CREATE POLICY "Users can view own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for focus_activities
CREATE POLICY "Users can view own focus activities"
  ON focus_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus activities"
  ON focus_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus activities"
  ON focus_activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus activities"
  ON focus_activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for attention_wallet
CREATE POLICY "Users can view own attention wallet"
  ON attention_wallet
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attention wallet"
  ON attention_wallet
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attention wallet"
  ON attention_wallet
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attention wallet"
  ON attention_wallet
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_screen_time_entries_user_id ON screen_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_screen_time_entries_date ON screen_time_entries(date);
CREATE INDEX IF NOT EXISTS idx_screen_time_entries_user_date ON screen_time_entries(user_id, date);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_distraction_logs_user_id ON distraction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_distraction_logs_date ON distraction_logs(date);
CREATE INDEX IF NOT EXISTS idx_distraction_logs_user_date ON distraction_logs(user_id, date);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

CREATE INDEX IF NOT EXISTS idx_focus_activities_user_id ON focus_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_activities_date ON focus_activities(date);
CREATE INDEX IF NOT EXISTS idx_focus_activities_user_date ON focus_activities(user_id, date);

CREATE INDEX IF NOT EXISTS idx_attention_wallet_user_id ON attention_wallet(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for attention_wallet updated_at
CREATE TRIGGER update_attention_wallet_updated_at
  BEFORE UPDATE ON attention_wallet
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create unique constraint to prevent duplicate entries per user per date
CREATE UNIQUE INDEX IF NOT EXISTS idx_screen_time_entries_unique_user_date_app 
  ON screen_time_entries(user_id, date, app_name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_distraction_logs_unique_user_date 
  ON distraction_logs(user_id, date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_focus_activities_unique_user_date_type 
  ON focus_activities(user_id, date, type);