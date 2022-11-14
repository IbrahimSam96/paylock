// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  console.log(req.body)
  const { ethers } = require('ethers');
  const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');

  let Forwarder = require("../../contracts/forwarder")

  // Unpack request
  const { to, from, value, gas, nonce, data } = req.body.request;
  // Initialize Relayer
  let credentials;

  if (req.body.chainID == 80001) {
    credentials = { apiKey: process.env.NEXT_PUBLIC_APIKey, apiSecret: process.env.NEXT_PUBLIC_APISecret };
  }
  if (req.body.chainID == 5) {
    credentials = { apiKey: process.env.NEXT_PUBLIC_APIKey_Goerli, apiSecret: process.env.NEXT_PUBLIC_APISecret_Goerli };
  }

  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
  const forwarder = new ethers.Contract(req.body.forwarder, Forwarder.ForwarderAbi, signer);


  try {
    const gasLimit = (parseInt(gas) + 50000).toString();
    const tx = await forwarder.execute(req.body.request, req.body.signature, { gasLimit });
    console.log(`Sent meta-tx: ${tx.hash}`);

  } catch (error) {
    console.log(error)
  }

  res.status(200).json({

  })
}
