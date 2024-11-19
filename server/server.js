 
 const express = require('express');
//  const mysql = require('mysql');
 const mysql = require('mysql2');
//  const session = require('express-session');

  const jwt = require('jsonwebtoken');
//  const jwt = require('jwt-simple');
 const cors = require('cors')
const bcrypt = require('bcrypt'); // or `bcryptjs` if you installed bcryptjs
const cookieParser = require('cookie-parser');
 

const app = express();

// Middleware : 3 it couls be 4 
app.use(express.json());  // To parse JSON request bodies
app.use(cookieParser());  // To parse cookies in request headers
//  app.use(cors());
// app.use(cors(corsOptions));

// Allow cross-origin requests from localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

 
// app.use(session({
//   secret: 'yourSecretKey',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false, httpOnly: true },
// }));

 
require('dotenv').config();

// Secret key for JWT (In a real application, store this in an environment variable)

const secretKey = process.env.JWT_SECRET;

// Create a direct MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});


  
 
  
  // Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

const PORT = 5000;




  
app.get('/api/user', (req, res) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  // Verify the JWT token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Respond with user data (decoded from the token)
    res.status(200).json({
      name: decoded.email, // Assuming `email` is stored in the token payload
      message: 'Welcome to the app!',
      // You can add more user information here if needed
    });
  });
});



// app.get('/', (req, res) => {
//   res.send('Hello, imad how is your day and   World!');
// });

   // Register endpoint with bcrypt for password hashing :
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Insert user data into the database with the hashed password
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.status(200).json({ success: true, message: 'User registered successfully' });
    });
  } catch (err) {
    console.error('Error hashing password:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
 
    // Login route
app.post('/api/login', (req, res) => {
  console.log('Request body:', req.body); // Log request body for debugging
  const { email, password } = req.body;

  // Find user by email in MySQL database:
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = results[0]; // Get the first user in the result

    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing password:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate a JWT token if the login is successful
      const payload = { email: user.email, id: user.id }; // Add user data to payload
      const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Set expiration (1 hour)

      // Send the token as an HTTP-only cookie
      res.cookie('auth_token', token, {
        httpOnly: true, // Prevents client-side access to the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        maxAge: 3600000, // 1 hour (in milliseconds)
        sameSite: 'Strict', // Controls cross-site request behavior
      });

      // Respond with success message (without token in the body, as it's now in the cookie)
      return res.status(200).json({
        message: 'Login successful',
      });
    });
  });
});

// Middleware to check if the user is authenticated using the cookie
app.get('/api/protected', (req, res) => {
  const token = req.cookies.auth_token; // Get token from cookie

  if (!token) {
    return res.status(403).json({ message: 'No token provided, access denied' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // If the token is valid, proceed
    res.status(200).json({ message: 'Access granted', user: decoded });
  });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });