const assert = require('assert');
const ganache = require('ganache-cli');

const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const { abi, bytecode } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
    // Get list of accounts
    accounts = await web3.eth.getAccounts();

    // Deploy contract with first account
    lottery = await new web3.eth.Contract(JSON.parse(abi))
        .deploy({data: bytecode, arguments: []})
        .send({from: accounts[0], gas: '1000000'});

    lottery.setProvider(provider);
});

describe('Lottery',  () => {
    it('deploys a contract', () => {
        // Ensure deployed contract is not null or undefined
        assert.ok(lottery.options.address);
    });

    it ('can enter one account', async() => {
        await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei('0.02', 'ether')});
        const players = await lottery.methods.getPlayers().call();

        assert.equal(accounts[1], players[0]);
        assert.equal(1, players.length);
    });

    it ('can enter multiple accounts', async() => {
        await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.02', 'ether')});
        await lottery.methods.enter().send({ from: accounts[1], value: web3.utils.toWei('0.05', 'ether')});
        await lottery.methods.enter().send({ from: accounts[4], value: web3.utils.toWei('0.01', 'ether')});
        const players = await lottery.methods.getPlayers().call();

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[4], players[2]);
        assert.equal(3, players.length);
    });

    it ('cannot enter with insufficient funds', async() => {
        try {
            await lottery.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.005', 'ether')});
            assert(false); // should not reach this point
        } catch(err) {
            assert(err);
        }
        const players = await lottery.methods.getPlayers().call();

        assert.equal(0, players.length);
    });


    it ('cannot be triggered without entrants', async() => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[0] });
            assert(false);
        } catch(err) {
            const results = err.results;
            // Ensure error caused by failed 'require' statement
            assert.equal(results[Object.keys(results)[0]].error, 'revert');
        }
    });
    
    it ('cannot be triggered by non-manager', async() => {
        try {
            await lottery.methods.pickWinner().send({ from: accounts[1] });
            assert(false);
        } catch(err) {
            const results = err.results;
            // Ensure error caused by failed 'require' statement
            assert.equal(results[Object.keys(results)[0]].error, 'revert');
        }
    });

    it ('sends money to winner and resets players[]', async() => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[1]);

        assert(finalBalance - initialBalance > web3.utils.toWei('1.8', 'ether')); // not exactly equal to 2 because of gas cost
        assert.equal((await lottery.methods.getPlayers().call()).length, 0);
    });
});
