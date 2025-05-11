export const GET_USER_PASSWORD = "SELECT password FROM users WHERE id = $1";

export const UPDATE_USER_PASSWORD = `
  UPDATE users 
  SET password = $1, updated_at = NOW() 
  WHERE id = $2
`;

export const UPDATE_USERNAME = `
  UPDATE users 
  SET username = $1, updated_at = NOW() 
  WHERE id = $2
`;

export const UPDATE_AVATAR = `
  UPDATE users 
  SET avatar_url = $1, updated_at = NOW() 
  WHERE id = $2
`;

export const GET_USER_AVATAR = "SELECT avatar_url FROM users WHERE id = $1";
