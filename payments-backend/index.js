require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { initiateStkPush } = require("./services/mpesa");
const { generateReceipt } = require("./services/receipt");
const { savePayment, getPayment } = require("./services/store");

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

    //save
    savePayment(result.CheckoutRequestID, {
      phone,
      amount,
      status: "pending",
      requestAt: new Date().toISOString(),
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

  const existing = getPayment(checkoutId);
  if (!existing) {
    console.warn("Callback for unknown checkoutId:", checkoutId);
    return res.json({ status: "Unknown" });
  }

  if (existing.status !== "pending") {
    console.log("Duplicate callback", checkoutId);
    return res.json({ status: "already processed" });
  }

  const resultCode = callback.ResultCode;
  if (resultCode === 0) {
    const metadata = callback.CallbackMetadata?.Item || [];
    const amountItem = metadata.find((i) => i.Name === "Amount");
    const amountReceived = amountItem?.Value;

    const receiptItem = metadata.find((i) => i.Name === "MpesaReceiptNumber");
    const receipt = receiptItem?.Value;

    if (Number(amountReceived) !== Number(existing.amount)) {
      console.log(`AMOUNT MISMATCH: expected ${existing.amount}`);
      savePayment(checkoutId, {
        ...existing,
        status: "mismatch",
        amountReceived,
        receipt,
      });
    } else {
      savePayment(checkoutId, {
        ...existing,
        status: "paid",
        amountReceived,
        receipt,
        paidAt: new Date().toISOString(),
      });
    }
  } else {
    savePayment(checkoutId, { ...existing, status: "failed", resultCode });
  }


  res.json({ status: "ok" });
});

app.get("/mpesa/receipt/:checkoutId", async (req, res) => {
  // TODO Day 4: look up the real payment from a store

  const pdf = await generateReceipt({
    phone: "254708374149",
    amount: 100,
    reference: req.params.checkoutId,
    date: new Date().toISOString(),
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="receipt-${req.params.checkoutId}.pdf"`,
  );
  res.send(pdf);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});
