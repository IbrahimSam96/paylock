export default async function handler(req, res) {

    const accountSid = process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
    const authToken = process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    let body = req.body.message + `- Please Visit https://paylock.vercel.app/code and enter ${req.body.code} to redeem your payment on ${req.body.network} `

    client.messages
        .create({
            body: body,
            from: '+18318513505',
            to: req.body.to
        })
        .then(message => {
            res.status(200).json({

            })
            console.log(message.sid)
        }).catch((err) => console.log(err));

}
