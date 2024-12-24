import { Client, Databases } from "node-appwrite";
import twilio from "twilio";

// In-memory storage for simplicity; consider using a database for production
const codes = {};

export default async ({ req, res, log, error }) => {
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT) // Appwrite API endpoint
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID) // Appwrite project ID
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY); // Appwrite API key

  // Twilio credentials
  const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
  const authToken = process.env.TWILIO_AUTH_TOKEN; // Twilio Auth Token
  const twilioClient = twilio(accountSid, authToken);
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER; // Twilio Phone Number

  try {
    // Log incoming request
    log("Received request:", req);

    // Parse request payload
    const { action, phone, code } = JSON.parse(req.payload || "{}");

    if (action === "send") {
      // Generate a random 4-digit code
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      codes[phone] = randomCode;

      // Send SMS via Twilio
      await twilioClient.messages.create({
        body: `Your verification code is: ${randomCode}`,
        from: twilioNumber,
        to: phone,
      });

      return res.json({ success: true, message: "Code sent successfully!" });
    } else if (action === "verify") {
      // Check if code matches
      if (codes[phone] === code) {
        delete codes[phone]; // Clear code after successful verification
        return res.json({
          success: true,
          message: "Code verified successfully!",
        });
      } else {
        return res.json({ success: false, message: "Invalid code." });
      }
    } else {
      return res.json({ success: false, message: "Invalid action." });
    }
  } catch (err) {
    // Log and handle any errors
    error("An error occurred:", err.message);
    return res.json({
      success: false,
      message: `An error occurred: ${err.message}`,
    });
  }
};
