import { Client } from "node-appwrite";
import twilio from "twilio";

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

  // Initialize Twilio client
  const twilioClient = twilio(
    "AC1dae4c12842289f635f488f533070d33",
    "1fe4533c39a88df6d91b1394d8ecdf5d"
  );
  const twilioNumber = "+12186585527"; // Replace with your Twilio phone number

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
      // Generate a verification code and store it
      const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      codes[phone] = generatedCode;
      log(`Generated code ${generatedCode} for phone ${phone}`);

      // Send the code via Twilio
      await twilioClient.messages.create({
        body: `Your verification code is: ${generatedCode}`,
        from: twilioNumber,
        to: phone,
      });

      return res.json({ success: true, message: "Code sent successfully!" });
    } else if (action === "verify") {
      // Verify the code
      if (codes[phone] === code) {
        delete codes[phone]; // Remove the code after successful verification
        return res.json({
          success: true,
          message: "Code verified successfully!",
        });
      } else {
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
    error("Error processing request:", err.message);
    return res.json({ success: false, message: `Error: ${err.message}` });
  }
};
