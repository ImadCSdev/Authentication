import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Container, Alert } from "react-bootstrap"; // Bootstrap components
import axios from "axios";

function Register() {
  const [name, setName] = useState(""); // Add state for name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    // Validate fields
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    const payload = { name, email, password };

    // Send data to the backend using axios
    axios
      .post("http://localhost:5000/api/register", payload)
      .then((response) => {
        if (response.data.success) {
          // Redirect to login page after successful registration
          navigate("/login");
        } else {
          setError(response.data.message);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.error("Error data:", err.response.data);
          setError(err.response.data.message || "Invalid request");
        } else {
          console.error("Login failed:", err.message);
          setError("An error occurred during login.");
        }
      });
      
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Register</h2>
        <Form onSubmit={handleRegister}>
          {/* Name Input */}
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

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
            Register
          </Button>
        </Form>

        {/* Error Handling */}
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Login Link */}
        <p className="text-center">
          Already have an account?{" "}
          <Button variant="link" onClick={() => navigate("/login")}>
            Login
          </Button>
        </p>
      </div>
    </Container>
  );
}

export default Register;
