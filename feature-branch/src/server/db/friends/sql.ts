export const GET_FRIENDS = `
  SELECT u.id, u.email, u.username, u.avatar_url, fr.status, fr.created_at
  FROM friend_relationships fr
  JOIN users u ON (fr.friend_id = u.id)
  WHERE fr.user_id = $1 AND fr.status = 'accepted'
  UNION
  SELECT u.id, u.email, u.username, u.avatar_url, fr.status, fr.created_at
  FROM friend_relationships fr
  JOIN users u ON (fr.user_id = u.id)
  WHERE fr.friend_id = $1 AND fr.status = 'accepted'
`;

export const CHECK_FRIENDSHIP = `
  SELECT status FROM friend_relationships 
  WHERE (user_id = $1 AND friend_id = $2) 
  OR (user_id = $2 AND friend_id = $1)
`;

export const CREATE_FRIEND_REQUEST = `
  INSERT INTO friend_relationships (user_id, friend_id, status)
  VALUES ($1, $2, 'pending')
  RETURNING id
`;

export const UPDATE_FRIEND_STATUS = `
  UPDATE friend_relationships 
  SET status = $1, updated_at = CURRENT_TIMESTAMP 
  WHERE user_id = $2 AND friend_id = $3 AND status = 'pending'
  RETURNING id
`;

export const DELETE_FRIENDSHIP = `
  DELETE FROM friend_relationships 
  WHERE (user_id = $1 AND friend_id = $2) 
  OR (user_id = $2 AND friend_id = $1)
  RETURNING id
`;

export const GET_FRIEND_REQUESTS = `
  SELECT u.id, u.email, u.username, u.avatar_url, fr.created_at
  FROM friend_relationships fr
  JOIN users u ON fr.user_id = u.id
  WHERE fr.friend_id = $1 AND fr.status = 'pending'
`;

export const GET_FRIEND_STATUS = `
  SELECT status 
  FROM friend_relationships 
  WHERE (user_id = $1 AND friend_id = $2) 
  OR (user_id = $2 AND friend_id = $1)
`;

// ... existing code ...
export const GET_CHAT_HISTORY = `
  SELECT 
    m.id,
    m.sender_id as "fromId",
    m.receiver_id as "toId",
    m.message as content,
    m.created_at as timestamp,
    m.is_read,
    u.username as "senderName",
    u.avatar_url as "senderAvatar",
    u.gravatar as "senderGravatar"
  FROM friend_messages m
  JOIN users u ON m.sender_id = u.id
  WHERE 
    (m.sender_id = $1 AND m.receiver_id = $2)
    OR (m.sender_id = $2 AND m.receiver_id = $1)
  ORDER BY m.created_at ASC
`;

export const SAVE_MESSAGE = `
  INSERT INTO friend_messages 
    (sender_id, receiver_id, message, created_at)
  VALUES 
    ($1, $2, $3, CURRENT_TIMESTAMP)
  RETURNING id
`;