var Web3 = require('web3');
var web3 = new Web3("https://ropsten.infura.io/v3/f2a5c301345b4741a7d99ee7b3bc0da4");
const fs = require('fs');
const contractDirectory = './contracts/';

fs.readdirSync(contractDirectory).forEach(contracts => {
    console.log(contracts);
  });