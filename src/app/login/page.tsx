"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Login successful - redirect or handle success
        console.log("Login successful:", data);
        // You can redirect here: window.location.href = "/my-recipes";
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container main">
      <div className="hero">
        <h2>Login to Your Account</h2>
        <p>Enter your credentials to access your recipes</p>

        <form onSubmit={handleLogin} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn--accent btn--full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="auth-links">
            <Link href="/register/" className="auth-link">
              Don't have an account?
            </Link>
            <Link href="/forgot-pwd/" className="auth-link">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}