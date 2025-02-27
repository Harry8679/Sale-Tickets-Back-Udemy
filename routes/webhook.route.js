const express = require("express");
const router = express.Router();
const { handleStripeWebhook } = require("../webhooks/stripe");

router.post("/", express.raw({ type: "application/json" }), handleStripeWebhook);

module.exports = router;