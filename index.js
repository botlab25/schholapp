require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

export default async ({ req, res, log, error }) => {
  // Log request details for debugging
  log(req.bodyText); // Raw request body, contains request data

  try {
    // Parse the request payload
    const payload = req.bodyJson || {};
    log("Parsed payload:", payload);

    // Extract numbers from the payload
    const { phoneNmber, otp } = payload;
    let msgOption = {
      from: TWILIO_PHONE_NUMBER,
      to: phoneNmber,
      body: `Hello Your code is  ${otp}`,
    };

    try {
      const message = await client.messages.create(msgOption);
      console.log("yeee", message);
    } catch (error) {
      console.log("errrrrr", error);
    }

    log("jjjjjjjjjjjjjkkkk", phoneNmber, otp, process.env.APPWRITE_API_KEY);

    // Return the result
    return res.json({
      success: true,
      message: "Numbers added successfully!",
    });
  } catch (err) {
    error("Error processing request:", err);
    return res.json({
      success: false,
      message: `Error: ${err.message}`,
    });
  }
};
