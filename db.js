const mongoose = require('mongoose');

mongoose.connect(
   'Your Connection String Here',
   { useNewParser: true, useUnifiedTopology: true }
);

const paymentSchema = new mongoose.Schema({
    id: String,
    itemId: String,
    paid: Boolean
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };