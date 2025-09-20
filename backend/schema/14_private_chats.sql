CREATE TABLE private_chats (
  id SERIAL PRIMARY KEY,
  sender_id UUID,
  receiver_id UUID,
  message TEXT,
  deleted BOOLEAN,
  created_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users (id),
  FOREIGN KEY (receiver_id) REFERENCES users (id)
); 