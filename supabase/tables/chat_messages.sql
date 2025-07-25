CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id VARCHAR(100) NOT NULL,
    sender_id UUID,
    sender_type VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);