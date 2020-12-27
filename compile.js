const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractName = 'Lottery';
const contractFileName = contractName + '.sol';
// Retrieve absolute path by appending root directory to contracts/Lottery.sol
const lotteryPath = path.resolve(__dirname, 'contracts', contractFileName);
// Read file by specifying utf8 encoding
const source = fs.readFileSync(lotteryPath, 'utf8');

const sources = {};
sources[contractFileName] = {content: source};

const input = {
    language: 'Solidity',
    sources: sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
};

const compiled = JSON.parse(solc.compile(JSON.stringify(input))).contracts[contractFileName][contractName];
const filteredCompilation = {};
filteredCompilation['abi'] = compiled['abi'];
filteredCompilation['bytecode'] = compiled['evm']['bytecode']['object'];

module.exports = filteredCompilation;