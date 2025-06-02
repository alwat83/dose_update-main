// index.js (CommonJS)
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

dotenv.config();

const app = express();

// ✅ Allow only specific origins
const allowedOrigins = [
  'https://9000-idx-doseupdate-1744142257475.cluster-6vyo4gb53jczovun3dxslzjahs.cloudworkstations.dev',
  'https://traveling-painful-somebody-election.trycloudflare.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 👇 Explicitly handle preflight OPTIONS requests
app.options('*', cors(corsOptions));


app.use(express.json());

// 🔐 Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found at', serviceAccountPath);
  process.exit(1);
}

console.log('🔍 Loading service account from:', serviceAccountPath);

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

// 📧 Brevo / Sendinblue email config
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

// 🗑️ Handle deletion requests
app.post('/api/delete-request', async (req, res) => {
  const { name, email, reason } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // 🔍 Check if user exists in Firebase Auth
    await auth.getUserByEmail(email);

    const mailOptions = {
      from: `"Dose Ninja" <${process.env.BREVO_USER}>`,
      to: process.env.BREVO_USER,
      subject: '🗑️ New Data Deletion Request',
      html: `
        <h3>New Request</h3>
        <p><strong>Email:</strong> ${email}</p>
        ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully ✅' });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ message: 'No user found with this email in Firebase Auth' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📬 Email server running at http://localhost:${PORT}`);
});
