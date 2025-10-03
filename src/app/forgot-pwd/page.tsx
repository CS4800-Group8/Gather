"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("If an account with that email exists, we've sent password reset instructions.");
      } else {
        setMessage(data.error || "An error occurred");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container main">
      <div className="hero">
        <h2>Reset Your Password</h2>
        <p>Enter your email address and we'll send you instructions to reset your password.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {message && (
            <div className={`message ${message.includes("error") ? "error-message" : "success-message"}`}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
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
              {loading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </div>

          <div className="auth-links">
            <Link href="/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}