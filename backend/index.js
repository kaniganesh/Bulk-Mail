const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.portnum || 5000;

app.use(cors());
app.use(express.json());

app.post("/send-mails", async (req, res) => {
    const { emails, subject, message } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ success: false, message: "No emails provided." });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = emails.map((email) => ({
            from: process.env.GMAIL_USER,
            to: email,
            subject,
            text: message,
        }));

        // Send all emails in parallel using Promise.all
        await Promise.all(mailOptions.map(mail => transporter.sendMail(mail)));

        res.status(200).json({ success: true, message: "Emails sent successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to send emails." });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
