// src/pages/LoginPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Use react-router-dom
import styles from "./LoginPage.module.css"; // Create this CSS Module
import InputField from "../components/Shared/InputField"; // Adjust path if needed
import { useAuth } from "../context/AuthContext"; // Adjust path if needed
import apiClient from "../api/axiosConfig"; // Adjust path if needed
import logger from "../utils/logger"; // Optional: Adjust path if needed

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Handler expected by our InputField component
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    const payload = { email: formData.email, password: formData.password };

    try {
      logger.info("Attempting login...");
      const response = await apiClient.post("/users/login", payload);
      logger.info("Login successful:", response.data);

      if (response.data.token && response.data.data.user) {
        login(response.data.token, response.data.data.user); // Update auth context
        if (response.data.data.redirectToOnboarding) {
          logger.info(
            `Redirecting to onboarding: ${response.data.data.redirectToOnboarding}`
          );
          return navigate(response.data.data.redirectToOnboarding); // Navigate to onboarding path
        }

        navigate("/profile"); // Redirect to dashboard
      } else {
        logger.error(
          "Login failed: Invalid response structure.",
          response.data
        );
        setError("Login failed. Unexpected response from server.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check credentials or network.";
      logger.error("Login error:", err.response?.data || err.message);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use standard div or main, not next/image directly here for logo link
    <main className={styles.container}>
      <Link to="/" className={styles.logo}>
        {" "}
        {/* Link logo to home */}
        <img
          src="/assets/gygg-logo.svg" // Ensure this is in public folder
          alt="GYGG logo"
          width={100} // Adjust size
          height={60}
        />
      </Link>

      <section className={styles.formContainer}>
        <h1 className={styles.title}>Log in</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="ex. email@domain.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            icon="password"
            required // Use icon prop
          />

          {/* Error display */}
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.footer}>
            {/* Forgot Password Link */}
            <div className={styles.forgotPasswordWrapper}>
              {/* Make sure /forgot-password route exists in App.js */}
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Sign Up Link */}
            <p className={styles.signupText}>
              Don't have an account yet?{" "}
              {/* Use /join as the entry point for signup flow */}
              <Link to="/join" className={styles.link}>
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
