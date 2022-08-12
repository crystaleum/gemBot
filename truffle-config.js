const solcStable = {
  version: '0.8.9',
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
const solcPre = {
  version: '0.6.12',
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
const solcNightly = {
  version: 'nightly',
  docker: true,
};

const useSolcNightly = process.env.SOLC_NIGHTLY === 'false';
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const privateKey = fs.readFileSync(".pk").toString().trim() || "01234567890123456789";
const ropsten_privateKey = fs.readFileSync(".rop.pk").toString().trim() || "01234567890123456789";
const eth_privateKey = fs.readFileSync("eth.pk").toString().trim() || "01234567890123456789";
const ethereum_privateKey = fs.readFileSync("ethereum.pk").toString().trim() || "01234567890123456789";
const crystal_privateKey = fs.readFileSync("crystal.pk").toString().trim() || "01234567890123456789";
const goerli_privateKey = fs.readFileSync("goerli.pk").toString().trim() || "01234567890123456789";
const polygon_privateKey = fs.readFileSync("poly.pk").toString().trim() || "01234567890123456789";
const mnemonic = fs.readFileSync(".secret").toString().trim();
const ethereum_privateKeys = [
  ethereum_privateKey
];
const goerli_privateKeys = [
  goerli_privateKey
];
const polygon_privateKeys = [
  polygon_privateKey
];
const _privateKeys = [
  privateKey
];
const _testnetPrivateKeys = [
  ropsten_privateKey
];
const _CrystaleumPrivateKeys = [
  crystal_privateKey
];
module.exports = {  
  networks: {
    localhost: {
      host : "localhost",
      port: 8545,
      network_id: 1337,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ethereum: {
      host : "https://mainnet.infura.io/v3/",
      port: 8545,
      network_id: 1,
      chain_id: 1,
      provider: () =>
        new HDWalletProvider({
          privateKeys: ethereum_privateKeys,
          providerOrUrl: "https://mainnet.infura.io/v3/",
      }),
    },
    goerli: {
      host : "https://goerli.infura.io/v3/",
      port: 8545,
      network_id: 5,
      chain_id: 5,
      provider: () =>
        new HDWalletProvider({
          privateKeys: goerli_privateKeys,
          providerOrUrl: "https://goerli.infura.io/v3/",
      }),
    },
    ropsten: {
      host : "https://ropsten.infura.io/v3/f2a5c301345b4741a7d99ee7b3bc0da4",
      port: 8545,
      network_id: 3,
      chain_id: 3,
      gasPrice: 37000000000,
      provider: () =>
        new HDWalletProvider({
          privateKeys: _testnetPrivateKeys,
          providerOrUrl: "https://ropsten.infura.io/v3/f2a5c301345b4741a7d99ee7b3bc0da4",
      }),
    },
    polygon: {
      host : "https://polygon-mainnet.infura.io/v3/f2a5c301345b4741a7d99ee7b3bc0da4",
      port: 8545,
      network_id: 137,
      chain_id: 137,
      gasPrice: 37000000000,
      provider: () =>
        new HDWalletProvider({
          privateKeys: polygon_privateKeys,
          providerOrUrl: "https://polygon-mainnet.infura.io/v3/f2a5c301345b4741a7d99ee7b3bc0da4",
      }),
    },
    crystaleum: {
      host : "https://rpc.crystaleum.org",
      port: 8545,
      network_id: 1,
      chain_id: 103090,
      gasPrice: 1000000000,
      provider: () =>
        new HDWalletProvider({
          privateKeys: _CrystaleumPrivateKeys,
          providerOrUrl: "https://rpc.crystaleum.org",
      }),
    },
    cronos: {
      host : "https://evm.cronos.org",
      port: 8545,
      network_id: 25,
      chain_id: 25,
      gasPrice: 1000000000,
      timoutBlocks: 1000000,
      networkCheckTimeout: 40000,
      provider: () =>
        new HDWalletProvider({
          privateKeys: _privateKeys,
          providerOrUrl: "https://evm.cronos.org",
      }),
    },
    hardhat: {
      chainId: 1337,
    },
  },
  compilers: {
    solc: solcStable,
    //solcPre
  },  
  api_keys: {
    cronoscan: '42VCWF776SWZ7A4HTSPCIJEZXZPG132NJE',
    etherscan: '',
    polygonscan: '1FJ4UGV2GXE22DRA9XI13I8Q1DZZ3X66R3',
    bscscan: ''
  },
  plugins: ['solidity-coverage', 'truffle-plugin-verify'],  

};
