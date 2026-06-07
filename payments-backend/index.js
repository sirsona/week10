require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { initiateStkPush } = require("./services/mpesa");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/mpesa/stk", async (req, res) => {
  const { phone, amount } = req.body;

  // validate -- manually never trust AI with money

  if (!phone || !/^2547\d{8}$/.test(phone)) {
    return res.status(400).json({ error: "Invalid phone" });
  }
  if (!amount || amount < 1 || amount > 150000) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const result = await initiateStkPush({
      phone,
      amount,
      accountRef: "TEST",
      description: "Test payment",
    });
    res.json(result);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "STK failed" });
  }
});

const processedCheckouts = new Set();
app.post("/mpesa/callback", (req, res) => {
  const callback = req.body.Body?.stkCallback;
  if (!callback) return res.status(400).end();

  const checkoutId = callback.CheckoutRequestID;
  if (processedCheckouts.has(checkoutId)) {
    console.log("Duplicate callback:", checkoutId);
    return res.json({ status: "Already processed" });
  }

  const resultCode = callback.ResultCode;
  if (resultCode === 0) {
    const metadata = callback.CallbackMetadata?.Item || [];
    const amountItem = metadata.find((i) => i.Name === "Amount");
    const receiptItem = metadata.find((i) => i.Name === "MpesaReceiptNumber");
    const phoneItem = metadata.find((i) => i.Name === "PhoneNumber");

    const AmountReceived = amountItem?.Value;

    console.log(
      `Payment received: ${AmountReceived} from ${phoneItem?.Value}, ref ${receiptItem?.Value}`,
    );

    processedCheckouts.add(checkoutId);
  } else {
    console.log(`Payment failed: code ${resultCode}`);
  }

  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});
