export const REGISTER_USER = `
  INSERT INTO users (email, password, gravatar) 
  VALUES ($1, $2, $3) 
  RETURNING id, gravatar
`;

export const LOGIN_USER = `
  SELECT * FROM users WHERE email = $1
`;

export const GET_USER_PASSWORD = `
  SELECT password FROM users WHERE id = $1
`;

export const UPDATE_USER_PASSWORD = `
  UPDATE users 
  SET password = $1, updated_at = CURRENT_TIMESTAMP 
  WHERE id = $2
`;

export const UPDATE_USERNAME = `
  UPDATE users 
  SET username = $1, updated_at = CURRENT_TIMESTAMP 
  WHERE id = $2
`;

export const GET_USER_AVATAR = `
  SELECT avatar_url FROM users WHERE id = $1
`;

export const UPDATE_AVATAR = `
  UPDATE users 
  SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP 
  WHERE id = $2
`;

export const UPDATE_STATS_WIN = `
  UPDATE users 
  SET games_played = games_played + 1, 
      games_won = games_won + 1, 
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = $1
`;

export const UPDATE_STATS_PLAYED = `
  UPDATE users 
  SET games_played = games_played + 1, 
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = $1
`;

export const GET_USER_BY_ID = `
  SELECT * FROM users WHERE id = $1
`;
