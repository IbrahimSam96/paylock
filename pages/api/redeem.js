// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {

  console.log(req.body.code)
  const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
  const { ethers } = require('ethers');


  const credentials = { apiKey: process.env.NEXT_PUBLIC_APIKey, apiSecret: process.env.NEXT_PUBLIC_APISecret };
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });


  try {
    let PayFactory = require("../../artifacts/contracts/PayFactory.sol/PayLock.json");
    let mumbaiAddress = require('../../mumbai');

    let paylockContract = new ethers.Contract(mumbaiAddress.mumbaiAddress, PayFactory.abi, signer);
    let transaction = await paylockContract.RedeemPayment(req.body.code, {
      gasLimit: 100000
    });

    await transaction.wait().then((response) => {


    })
      .catch((err) => {

        console.log(err)
      })


  } catch (error) {
    console.log(error)
  }

  res.status(200).json({

  })
}
