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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});
