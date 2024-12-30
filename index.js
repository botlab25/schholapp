require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKIN;

console.log("auth", accountSid);

const client = require("twilio")(accountSid, authToken);

const sendSMS = async (body) => {
  let msgOption = {
    from: +12186585527,
    to: +2349091086733,
    body,
  };

  try {
    const message = await client.messages.create(msgOption);
    console.log("yeee", message);
  } catch (error) {
    console.log("errrrrr", error);
  }
};

sendSMS("Hello Your code is  ....");
