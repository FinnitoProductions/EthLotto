const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { abi, bytecode } = require('./compile.js');

const fs = require("fs");
const seed = fs.readFileSync('seed.csv', 'utf8');
const rinkebyNetwork = 'https://rinkeby.infura.io/v3/5ff615e58c764538aa6bb87104b2824a';

const provider = new HDWalletProvider(seed, rinkebyNetwork);
const web3 = new Web3(provider);

const deploy = async () => { 
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0])
    
    // Deploy contract with account
    const contractAddress = await new web3.eth.Contract(abi)
        .deploy({data: bytecode, arguments: []})
        .send({from: accounts[0], gas: '1000000'});

    // console.log(abi);
    console.log('Contract deployed to', contractAddress.options.address)
}

deploy();