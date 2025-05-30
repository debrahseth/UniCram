const express = require("express");
const sgMail = require("@sendgrid/mail");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

require("dotenv").config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY is not set in .env file");
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

app.post("/send-welcome-email", async (req, res) => {
  const { to, username } = req.body;

  const msg = {
    to,
    from: "YOUR_VERIFIED_SENDER_EMAIL",
    subject: "Welcome to Prime Academy!",
    text: `Hello ${username}, welcome to Prime Academy! We're excited to have you on board.`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="color: #4CAF50;">Welcome, ${username}!</h1>
  
        <p>🎉 Welcome to <strong>Prime Academy</strong> — where learning meets excitement!</p>
  
        <p>We’re thrilled to have you join a community built for engineering students, by engineering students. Here at Prime Academy, you’ll sharpen your skills through quick, challenging quizzes tailored to your courses, race against the clock with time limits (5, 10, or 30 minutes), and even challenge your friends to see who's the fastest and sharpest!</p>
  
        <p><strong>Our mission is simple:</strong> Practice more. Learn faster. Succeed better — all while making learning fun and competitive!</p>
  
        <p>Remember: Growth happens when you challenge yourself. Keep pushing your limits, and never stop aiming higher. 🚀</p>
  
        <p>🤝 Also, as we move forward together, don’t forget to support <strong>Prince Oppong for GESA President</strong> in the upcoming elections. Together, we can drive even bigger change for all engineering students!</p>
  
        <p>Once again, welcome to Prime Academy — let’s make history together!</p>
  
        <p style="margin-top: 30px;">Best regards,<br>
        🚀 The Prime Academy Team</p>
        <p style="color:gray; font-size:12px;">If you find this email in your spam folder, please mark it as "Not Spam" to ensure future emails reach your inbox.</p>
      </div>`,
  };

  try {
    await sgMail.send(msg);
    res
      .status(200)
      .json({ success: true, message: "Welcome email sent successfully" });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(
    `Server running on port ${PORT} at ${new Date().toLocaleString("en-US", {
      timeZone: "GMT",
    })}`
  )
);
