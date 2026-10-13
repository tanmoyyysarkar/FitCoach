DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'content'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'body'
    ) THEN
        ALTER TABLE messages RENAME COLUMN content TO body;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'recipient_id'
    ) THEN
        ALTER TABLE messages ADD COLUMN recipient_id BIGINT;
    END IF;
END $$;

UPDATE messages AS m
SET recipient_id = CASE
    WHEN m.sender_id = cc.trainer_id THEN cc.client_id
    ELSE cc.trainer_id
END
FROM coach_clients AS cc
WHERE m.coach_client_id = cc.coach_client_id
  AND m.recipient_id IS NULL;

ALTER TABLE messages
    ALTER COLUMN recipient_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_message_recipient'
          AND conrelid = 'messages'::regclass
    ) THEN
        ALTER TABLE messages
            ADD CONSTRAINT fk_message_recipient
            FOREIGN KEY (recipient_id)
            REFERENCES users(user_id)
            ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'message_participants_are_different'
          AND conrelid = 'messages'::regclass
    ) THEN
        ALTER TABLE messages
            ADD CONSTRAINT message_participants_are_different
            CHECK (sender_id <> recipient_id);
    END IF;
END $$;

ALTER TABLE messages DROP COLUMN IF EXISTS coach_client_id;

CREATE INDEX IF NOT EXISTS messages_conversation_idx
    ON messages (sender_id, recipient_id, sent_at);
