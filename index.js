require("dotenv").config();
const { Client, Databases } = require("node-appwrite");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const appwriteClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your Appwrite Project ID
  .setKey(process.env.APPWRITE_API_KEY); // Your Appwrite API Key

module.exports = async function (req, res) {
  try {
    const eventData = JSON.parse(process.env.APPWRITE_FUNCTION_DATA || "{}");
    const { phoneNumber, otp } = eventData;

    if (!phoneNumber || !otp) {
      console.error("Phone number or OTP missing");
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Phone number and OTP are required" })
      );
    }

    // Send OTP using Twilio
    try {
      const message = await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
        body: `Your OTP code is ${otp}`,
      });
      console.log("OTP sent:", message.sid);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: true, message: "OTP sent successfully" })
      );
    } catch (error) {
      console.error("Twilio error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ success: false, error: "Failed to send OTP" })
      );
    }
  } catch (error) {
    console.error("Function error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
