# Money code audit

## Day 1

-> No money-touching code yet- only health checks and setup

index.js - student

.env.example - student

.gitignore - student

day1-architecture.md - student

## Day 2 - STK Push Implementation

## services/mpesa.js — student

### Token Exchange (`getToken()`)

Handles OAuth authentication with Safaricom Daraja API.

- Uses Consumer Key + Secret (Base64 encoded Basic Auth)
- Requests access token from sandbox endpoint
- Returns token for authenticated API calls

## index.js — student

### STK Initiation (`POST /mpesa/stk`)

Handles payment request initiation.

- Validates phone number using `/^2547\d{8}$/`
- Validates amount range (1 – 150,000 KES)
- Calls STK Push service in `services/mpesa.js`
- Returns Daraja response to client

### Callback Handler (`POST /mpesa/callback`)

Handles payment confirmation from Safaricom.

- Receives STK callback payload
- Extracts payment metadata:
  - Amount
  - Phone number
  - Mpesa receipt number
- Implements idempotency using in-memory `processedCheckouts` Set
- Prevents duplicate processing of the same transaction
- Always returns HTTP 200 to stop Daraja retry attempts
