CREATE TABLE IF NOT EXISTS messages (
    message_id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT NOT NULL,
    body TEXT NOT NULL CHECK (length(trim(body)) > 0),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_message_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT message_participants_are_different
        CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx
    ON messages (sender_id, recipient_id, sent_at);
