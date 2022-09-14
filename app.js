const express = require('express');
const ethereumTx = require('ethereumjs-tx').Transaction;
const common = require('ethereumjs-common');
const web3 = require('web3');
const { send } = require('express/lib/response');
const { raw } = require('express');

require('dotenv').config();
const app = express();
const port = 3000;

const web3Client = new web3(new web3.providers.HttpProvider('https://polygon-mainnet.infura.io/v3/' + process.env.INFURA_KEY));
const contractABI = [{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
const awgContractAddress = '0xAEe0ffb690B37449B7f1C49B199E1E3ec6084490';
const awsContractAddress = '0xa96d47c621a8316d4f9539e3b38180c7067e84ca';

const awsContract = new web3Client.eth.Contract(contractABI,awsContractAddress);
const awgContract = new web3Client.eth.Contract(contractABI,awgContractAddress);

const chain = common.default.forCustomChain(
    'mainnet',{
        name: 'matic-mainnet',
        networkId: 137,
        chainId: 137,
        url: 'https://polygon-rpc.com'
    },
    'petersburg'
);

app.get('/transfer-tokens/:currency/:address/:amount', async (req, res) => {

    let address = req.params.address;
    let currency = req.params.currency;
    let amount = Number.parseFloat(req.params.amount);

    if (currency !== 'awg' && currency !== 'aws') {
        return res.json({
            success: false,
            message: "Parameters are invalid",
            data: req.params
        });
    }

    if (!web3.utils.isAddress(address) || !amount) {
        return res.json({
            success: false,
            message: "Parameters are invalid",
            data: req.params
        });
    }    
    amount = web3.utils.toWei(amount.toString(),'ether');

    web3Client.eth.getTransactionCount(process.env.WALLET_PUBLIC_ADDRESS, null, async function(nonceError, nonce) {
        if (nonceError || !Number.isInteger(nonce)) {
            return res.json({
                success: false,
                message: "Couldn't get account nonce for " + process.env.WALLET_PUBLIC_ADDRESS,
                error: nonceError
            });          
        }

        web3Client.eth.getGasPrice(async function(gasError, gasPrice) { 
            if (gasError || !gasPrice) {
                return res.json({
                    success: false,
                    message: "Couldn't get gas price",
                    error: gasError
                });
            }

            let privKey = new Buffer(process.env.WALLET_PRIVATE_KEY,'hex');
            let rawTransaction;
            gasPrice = parseFloat(gasPrice) * 2;
            if (currency === 'awg') {
                rawTransaction = {
                    "from": process.env.WALLET_PUBLIC_ADDRESS,
                    "to": awgContractAddress,
                    "nonce": web3Client.utils.toHex(nonce),
                    "gasPrice": web3Client.utils.toHex(gasPrice),
                    "gasLimit": web3Client.utils.toHex(100000),
                    "data": awgContract.methods.transfer(address, amount).encodeABI(),
                    "value": "0x",
                    "chainId":"137"
                };
            } else {
                rawTransaction = {
                    "from": process.env.WALLET_PUBLIC_ADDRESS,
                    "to": awsContractAddress,
                    "nonce": web3Client.utils.toHex(nonce),
                    "gasPrice": web3Client.utils.toHex(gasPrice),
                    "gasLimit": web3Client.utils.toHex(100000),
                    "data": awsContract.methods.transfer(address, amount).encodeABI(),
                    "value": "0x",
                    "chainId":"137"
                };                
            }
        
            let tx = new ethereumTx(rawTransaction, {common: chain});
            tx.sign(privKey);
            tx = tx.serialize();
            tx = "0x" + tx.toString('hex');     


            web3Client.eth.sendSignedTransaction(tx, function(sendError, transactionHash) {
                console.log(sendError);
                if (sendError || !transactionHash) {
                    return res.json({
                        success: false,
                        message: "Cannot send transaction",
                        error: sendError
                    });
                }

                return res.json({
                    success: true,
                    data: transactionHash,
                    gas_price: gasPrice,
                    nonce: nonce
                })
            });
        });

    });

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});