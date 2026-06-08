import { useState } from "react";

function PayForm() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [checkoutId, setCheckoutId] = useState("");

  async function handlePay(e) {
    e.preventDefault();
    setStatus("pending");
    setMessage("Check your phone for the M-Pesa prompt");

    try {
      const res = await fetch("http://localhost:3001/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount: parseInt(amount, 10) }),
      });
      const data = await res.json();

      if (data.ResponseCode === "0") {
        setStatus("success");
        setMessage(`STK sent. Checkout ID: ${data.CheckoutRequestID}`);
        setCheckoutId(data.CheckoutRequestID);
        // TODO Day 4: pool for completion
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to send STK");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <form onSubmit={handlePay}>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="254..."
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        required
      />
      <button type="submit" disabled={status === "pending"}>
        {status === "pending" ? "Sending..." : "Pay with M-Pesa"}
      </button>
      <p>{message}</p>
      {checkoutId && status === "success" && (
        <a
          href={`http://localhost:3001/mpesa/receipt/${checkoutId}`}
          target="_blank"
        >
          View Receipt
        </a>
      )}
    </form>
  );
}

export default PayForm;
