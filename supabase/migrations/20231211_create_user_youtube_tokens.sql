-- Create user_youtube_tokens table
CREATE TABLE IF NOT EXISTS user_youtube_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT NOT NULL,
    expires_in INTEGER NOT NULL,
    scope TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Set up RLS policies
ALTER TABLE user_youtube_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update only their own tokens
CREATE POLICY "Users can view their own tokens"
    ON user_youtube_tokens
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
    ON user_youtube_tokens
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
