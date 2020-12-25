const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractName = 'Lottery';
// Retrieve absolute path by appending root directory to contracts/Lottery.sol
const lotteryPath = path.resolve(__dirname, 'contracts', contractName + '.sol');
// Read file by specifying utf8 encoding
const source = fs.readFileSync(lotteryPath, 'utf8');

const compiled = solc.compile(source, 1).contracts[':' + contractName]
compiled['abi'] = compiled['interface']
module.exports = compiled