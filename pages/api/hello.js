// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {

  const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
  const { ethers } = require('ethers');
  const hre = require("hardhat");


  const credentials = { apiKey: process.env.NEXT_PUBLIC_APIKey, apiSecret: process.env.NEXT_PUBLIC_APISecret };
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });




  res.status(200).json({})
}
