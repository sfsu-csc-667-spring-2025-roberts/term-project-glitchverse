// Handles registration and login logic
export async function registerUser(username: string, email: string, password: string): Promise<Response> {
    return fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  }
  
  export async function loginUser(email: string, password: string): Promise<Response> {
    return fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }
  