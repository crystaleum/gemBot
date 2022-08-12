var Web3 = require('web3');
var web3 = new Web3("https://ropsten.infura.io/v3/f2a5c301345b4741a7d99ee7b3bc0da4");
const fs = require('fs');
module.exports = async function (deployer) {
  const contractDirectory = './contracts/';
  fs.readdirSync(contractDirectory).forEach(contracts => {
    console.log(contracts);
    try {
      const data = fs.readFileSync('../configs/'+contracts+".json", 'utf8');
      console.log(data);
      let conf = {
        arguments: []
      }
      // conf.arguments.push(data);
      // dploy(conf);
    } catch (err) {
      console.error(err);
    }
    async function dploy(conf){
      await deployer.deploy(contracts).then(function(instance) {
        contractAddress = instance;
        console.log(instance);
      }).catch(function(e) {
        console.log(e);
        // There was an error! Handle it.
      });
    }
  });
 };