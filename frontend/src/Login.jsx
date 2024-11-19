import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios"; // Import Axios
import { Button, Form, Container, Alert } from "react-bootstrap"; // Bootstrap components

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function to use for redirection

  // Check if the token exists in localStorage and redirect if it does
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      navigate("/home"); // If token exists, navigate to home
    }
  }, [navigate]); // Dependency array to trigger effect only when `navigate` changes

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/api/login', 
        {
          email,
          password
        }, 
        { withCredentials: true }  // Ensure credentials (cookies) are sent
      );
  
      if (response.status === 200) {
        // Handle successful login (redirect, etc.)
        navigate("/home");
      } else {
        setError('Login failed: Unexpected response.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('An error occurred during login.');
    }
  };
  
  
  
        
  
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Login</h2>
        <Form onSubmit={handleLogin}>
          {/* Email Input */}
          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          {/* Password Input */}
          <Form.Group controlId="formPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {/* Submit Button */}
          <Button variant="primary" type="submit" className="w-100 mb-3">
            Login
          </Button>
        </Form>

        {/* Error Handling */}
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Register Link */}
        <p className="text-center">
          Don't have an account?{" "}
          <Button variant="link" onClick={() => navigate("/register")}>
            Register
          </Button>
        </p>
      </div>
    </Container>
  );
}

export default Login;
