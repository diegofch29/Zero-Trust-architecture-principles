import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import "./App.css";

interface Message {
  messageText: string;
  clientIp: string;
  timestamp: string;
}

interface LoginResponse {
  token: string;
  username: string;
}

function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (storedToken) {
      setToken(storedToken);
      setUsername(storedUsername || "");
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch messages when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const fetchMessages = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        setError("Session expired. Please login again.");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data: Message[] = await response.json();
      setMessages(data);
      setError("");
    } catch (err) {
      setError("Error fetching messages: " + (err as Error).message);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data: LoginResponse = await response.json();
      setToken(data.token);
      setUsername(data.username);
      setIsAuthenticated(true);

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      setPassword("");
    } catch (err) {
      setError("Login error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (): void => {
    setToken(null);
    setUsername("");
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setMessages([]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (response.status === 401) {
        handleLogout();
        setError("Session expired. Please login again.");
        return;
      }

      if (!response.ok) throw new Error("Failed to send message");

      setMessage("");
      await fetchMessages();
    } catch (err) {
      setError("Error sending message: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setMessage(e.target.value);
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="container">
          <h1>🔒 Message Board - Login</h1>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter username"
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter password"
                className="form-input"
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          <div className="info-box">
            <h3>Demo Credentials:</h3>
            <p>
              <strong>admin</strong> / admin123
            </p>
            <p>
              <strong>user1</strong> / password1
            </p>
            <p>
              <strong>user2</strong> / password2
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>🔐 Secure Message Board</h1>
          <div className="user-info">
            <span>
              Welcome, <strong>{username}</strong>
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Enter your message..."
            className="message-input"
            disabled={loading}
          />
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <div className="messages-container">
          <h2>Last 10 Messages</h2>
          {messages.length === 0 ? (
            <p className="no-messages">
              No messages yet. Be the first to post!
            </p>
          ) : (
            <ul className="messages-list">
              {messages.map((msg, index) => (
                <li key={index} className="message-item">
                  <div className="message-text">{msg.messageText}</div>
                  <div className="message-meta">
                    <span className="message-ip">IP: {msg.clientIp}</span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
