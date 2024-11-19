import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

function Home() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function to use for redirection

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem("auth_token");

    if (!token) {
      // If no token is found, redirect to login page
      navigate("/login");
    } else {
      // Make an API request using Axios
      axios
        .get("http://localhost:5000/api/user", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        })
        .then((response) => {
          if (response.data.name) {
            setUserData(response.data); // Set the user data received from the response
          } else {
            setError("User data not available.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setError("Failed to fetch user data.");
          // Redirect to login on error
          navigate("/login");
        });
    }
  }, [navigate]); // Include navigate in the dependency array to avoid warnings

  return (
    <div>
      {error ? (
        <h1>{error}</h1> // Display error message if any
      ) : userData ? (
        <div>
          <h1>Home: Hello, {userData.name}!</h1>
          <p>{userData.message}</p>
        </div>
      ) : (
        <h1>Loading...</h1> // Show loading message while fetching data
      )}
    </div>
  );
}

export default Home;
