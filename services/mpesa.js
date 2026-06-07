require("dotenv").config();
const axios = require("axios");

async function getToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    },
  );

  return res.data.access_token;
}

async function initialStkPush(phone, amount, accountRef) {
  const token = await getToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:\.Z]/g, "")
    .slice(0, 14);
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64",
  );

  const payload = {
    BusinessShortCode: shortcode,
    password: password,
    TimeStamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartB: shortcode,
    PhoneNumber: phone,
    CallBackURL: `${process.env.PUBLIC_URL}/mpesa/callback`,
    AccountReference: accountRef,
    TransactionDesc: description,
  };

  const res = await axios.post(
    "https://sanbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    payload,
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

module.exports = { getToken, initialStkPush };
