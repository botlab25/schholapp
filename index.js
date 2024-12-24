const sdk = require("node-appwrite");
const twilio = require("twilio");

// Store codes in memory (for simplicity; consider using a database for production)
const codes = {};

module.exports = async function (req, res) {
  const client = new sdk.Client();
  const accountSid = "AC1dae4c12842289f635f488f533070d33";
  const authToken = "1fe4533c39a88df6d91b1394d8ecdf5d";
  const twilioClient = twilio(accountSid, authToken);

  try {
    const { phone, code, action } = JSON.parse(req.payload);

    if (action === "send") {
      // Generate a random 4-digit code
      const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
      codes[phone] = randomCode;

      // Send SMS using Twilio
      await twilioClient.messages.create({
        body: `Your verification code is: ${randomCode}`,
        from: "+12186585527",
        to: phone,
      });

      res.json({ success: true, message: "Code sent successfully!" });
    } else if (action === "verify") {
      // Validate the provided code
      if (codes[phone] === code) {
        delete codes[phone]; // Clear the code after successful verification
        res.json({ success: true, message: "Code verified!" });
      } else {
        res.json({ success: false, message: "Invalid code." });
      }
    } else {
      res.json({ success: false, message: "Invalid action." });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
