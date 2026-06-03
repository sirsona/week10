# Payments Architecture

Customer --> React frontend --> Express backend --> Daraja API --> Customer's
phone <-- callback <-- Daraja

## 1. Why Daraja calls your server and not the other way around

- Daraja calls your server back because the payment happens on the customer's
  phone, not on your server.
- Your server initiates the STK push request to Daraja, which then sends a
  prompt to the customer's M-Pesa app.
- The customer enters their PIN on their phone to complete the transaction.
  Daraja needs a way to tell your server whether the payment succeeded or
  failed, so it calls your callback URL after the customer finishes the
  transaction.

## 2. Why you need ngrok (or a real server) for the callback

- You need ngrok (or a real server) because Daraja requires a publicly
  accessible HTTPS URL for callbacks.
- During development, your localhost isn't accessible from the internet, so
  ngrok creates a tunnel that forwards HTTPS requests from the public internet
  to your local machine.

## 3. What would happen if you lost the callback (hint: the customer would be charged but you would not know)

- If you lost the callback, your customer would be charged but your server would
  never know.
- The money would leave their account, but your database would still show the
  payment as pending.
- You might not deliver the goods or service, creating a bad customer experience
  and potential refund requests.
- You also couldn't update order statuses or trigger fulfillment workflows.
- The callback is the only way Daraja reliably tells you the final status of a
  transaction.
