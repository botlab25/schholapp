import { Client } from "node-appwrite";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";

export default async ({ req, res, log, error }) => {
  // Log request details for debugging
  log(req.bodyText); // Raw request body, contains request data
  log(JSON.stringify(req.bodyJson)); // Object from parsed JSON request body, otherwise string
  log(JSON.stringify(req.headers)); // String key-value pairs of all request headers, keys are lowercase
  log(req.scheme); // Value of the x-forwarded-proto header, usually http or https
  log(req.method); // Request method, such as GET, POST, PUT, DELETE, PATCH, etc.
  log(req.url); // Full URL, for example: http://awesome.appwrite.io:8000/v1/hooks?limit=12&offset=50
  log(req.host); // Hostname from the host header, such as awesome.appwrite.io
  log(req.port); // Port from the host header, for example 8000
  log(req.path); // Path part of URL, for example /v1/hooks
  log(req.queryString); // Raw query params string. For example "limit=12&offset=50"
  log(JSON.stringify(req.query)); // Parsed query params. For example, req.query.limit

  // Initialize Appwrite client
  const client = new Client();
  client
    .setEndpoint("https://[YOUR_APPWRITE_ENDPOINT]") // Replace with your Appwrite endpoint
    .setProject("[YOUR_PROJECT_ID]") // Replace with your Appwrite project ID
    .setKey("[YOUR_APPWRITE_API_KEY]"); // Replace with your Appwrite API Key

  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "[YOUR_FIREBASE_API_KEY]",
    authDomain: "[YOUR_FIREBASE_AUTH_DOMAIN]",
    projectId: "[YOUR_FIREBASE_PROJECT_ID]",
    storageBucket: "[YOUR_FIREBASE_STORAGE_BUCKET]",
    messagingSenderId: "[YOUR_FIREBASE_MESSAGING_SENDER_ID]",
    appId: "[YOUR_FIREBASE_APP_ID]",
  };

  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const codes = {}; // Store verification codes temporarily

  try {
    // Parse the request payload
    const payload = req.bodyJson || {};
    log("Parsed payload:", payload);

    const { action, phone, code } = payload;
    log("Extracted action:", action);

    if (!action) {
      return res.json({
        success: false,
        message: "Invalid or missing action in payload.",
      });
    }

    if (action === "send") {
      // Set up Firebase Phone Authentication (reCAPTCHA is required)
      const appVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
        },
        auth
      );

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );
      log(`Confirmation result received for phone ${phone}`);
      codes[phone] = confirmationResult; // Store confirmation result
      return res.json({ success: true, message: "Code sent successfully!" });
    } else if (action === "verify") {
      // Verify the code
      const confirmationResult = codes[phone];
      if (!confirmationResult) {
        return res.json({
          success: false,
          message: "No OTP sent to this phone number.",
        });
      }

      try {
        const userCredential = await confirmationResult.confirm(code);
        delete codes[phone]; // Clear the confirmation result after verification
        return res.json({
          success: true,
          message: "Code verified successfully!",
          user: userCredential.user,
        });
      } catch (verificationError) {
        log("OTP verification error:", verificationError);
        return res.json({
          success: false,
          message: "Invalid verification code.",
        });
      }
    } else {
      log("Invalid action:", action);
      return res.json({ success: false, message: "Invalid action provided." });
    }
  } catch (err) {
    error("Error processing request:", err);
    return res.json({ success: false, message: `Error: ${err.message}` });
  }
};
