const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dns = require('dns');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. PostgreSQL Connection Config
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Root', // Aapka PostgreSQL password
  port: 5432,
});

// Auto-create table if it doesn't exist
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database table checked/created successfully.');
  } catch (err) {
    console.error('Database Initialization Error:', err.message);
  }
};
initDB();

// 2. Rate Limiter (Spamming protection: Max 3 requests per 15 minutes per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3,
  message: { success: false, error: 'Too many requests. Please try again after 15 minutes.' }
});

// List of fake/temporary email providers
const disposableDomains = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 
  'mailinator.com', 'dispostable.com', 'trashmail.com'
];

// Helper function to verify email domain MX records
function verifyEmailDomain(email) {
  return new Promise((resolve) => {
    const domain = email.split('@')[1];

    if (!domain) return resolve(false);

    // Block known disposable domains
    if (disposableDomains.includes(domain.toLowerCase())) {
      return resolve(false);
    }

    // Check if domain can receive emails (MX records exist)
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return resolve(false);
      }
      resolve(true);
    });
  });
}

// 3. Secure Contact API Endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message, website_url } = req.body;

  // A. Honeypot Bot Detection Check
  if (website_url) {
    return res.status(400).json({ success: false, error: 'Bot submission detected.' });
  }

  // B. Input Validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  // C. Email Format Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address format.' });
  }

  // D. Email Domain & MX Verification
  const isValidDomain = await verifyEmailDomain(email);
  if (!isValidDomain) {
    return res.status(400).json({ success: false, error: 'Please provide a valid, active email address.' });
  }

  // E. Database Insertion
  try {
    const queryText = 'INSERT INTO contact_messages(name, email, message) VALUES($1, $2, $3) RETURNING *';
    const result = await pool.query(queryText, [name.trim(), email.trim(), message.trim()]);
    
    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully!',
      data: result.rows[0] 
    });
  } catch (err) {
    console.error('DB Insert Error:', err.message);
    res.status(500).json({ success: false, error: 'Database server error. Please try again later.' });
  }
});

// Server Start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});