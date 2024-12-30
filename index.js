require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Client, Databases } = require("node-appwrite");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKIN;
const twilioClient = require("twilio")(accountSid, authToken);

const appwriteClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your Appwrite Project ID
  .setKey(process.env.APPWRITE_API_KEY); // Your Appwrite API Key

console.log("auth", accountSid);

app.post("/send-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      body: `Your OTP code is ${otp}`,
    });
    console.log("yeee", message);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Twilio error:", error);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

sendSMS("Hello Your code is  ....");
