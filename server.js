const Koa = require("koa");
const Router = require("@koa/router");
const cors = require("@koa/cors");
const ethers = require("ethers");

const PaymentProcessor = require("./sc/contracts/PaymentProcessor.json");

const { Payment } = require("./db");

const items = {
    '1': { id: 1, url: 'http://urlTodownloadItem1' },
    '2': { id: 2, url: 'http://urlTodownloadItem2' },
    '3': { id: 3, url: 'http://urlTodownloadItem3' }
};

const app = new Koa();
const router = new Router();

router.get('/api/getPaymentId/:itemId', async ctx => {
    const paymentId = (Math.random() * 1000).toFixed(0);
    await Payment.create({
        id: paymentId,
        item: ctx.params.itemId,
        paid: false
    });
    ctx.body = { paymentId };
});

router.get('/api/getitemUrl/:paymentId', async ctx => {
    const payment = await Payment.findOne({ id: ctx.params.paymentId });
    if (payment && payment.paid === true) {
        ctx.body = {
            url: items[payment.itemId].url,
        };
    }
    else {
        ctx.body = {
            url: ''
        }
    }
});

app.use(cors())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(4000, () => {
    console.log("Running on Port 4000");
});

const listenToEvents = () => {
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:9545');
    const networkId = '5777';

    const paymentProcessor = new ethers.Contract(
        PaymentProcessor.networks[networkId].address,
        PaymentProcessor.abi,
        provider
    )

    paymentProcessor.on('PaymentDone', async (payer, amount, paymentId, date) => {

        console.log(`
            from: ${payer}
            amount: ${amount},
            paymentId: ${paymentId}
            date: ${(new Date(date.toNumber() * 1000)).toLocaleString()}
        `);

        const payment = await Payment.findOne({ id: paymentId });
        if (payment) {
            payment.paid = true;
            await payment.save();
        }

    })
}