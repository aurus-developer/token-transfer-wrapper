# Aurus Token Transfer Wrapper

This project enables Aurus partners and integrators to easily transfer PM tokens on the Polygon network. 

## Installation

In order to run the application, you need to have `node v16` and `npm v8.5`.
To install them, please visit the following links:

https://nodejs.org/en/download/package-manager/

https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

After the required libraries are installed, you need to install the packages with:

`npm install`

Then run the application with

`node app`

The application will run locally on port 3000 at http://localhost:3000

## Use the API

The application is executed as a service that runs locally on your device. You can interact with the application by making GET calls to the respective URL

## Configure parameters

The application requires an Infura key. You can get a key at https://infura.io. Select a key for the Polygon network
Also, you need to have a wallet (Polygon) with AWG/AWS and MATIC tokens on it. 

Copy the .env.example file to .env and fill the blanks:
INFURA_KEY = Your Infura API Key (for example: `22fg2935fge64238cf7328ca36f0283hd80234`)
WALLET_PRIVATE_KEY = Your wallet private key (for example: `f9d1e0da4c446f7b2e647456d10cfe8b3a2049b653d0f12071e5258005a60174`)
WALLET_PUBLIC_ADDRESS = Your wallet public address (for example: `0x1d4377dab4a4f6D99a4e3891D64Cf5cd4BD805e7`)

### Request format

The GET request format is the following:

GET http://localhost:3000/transfer-tokens/#currency/#address/#amount

It has 3 parameters:
#currency = The currency can be `awg` or `aws`.
#address = The Ethereum/Polygon format public address (for example `0xb9993c6F53bD6946E7ce26d1Ad3AE286D437B238`).
#amount = The amount of tokens with decimals.

An example of request:
GET http://localhost:3000/transfer-tokens/awg/0x410127642C549A899E29182003A1e3F33422eB66/5.25

This requests sends `5.25 AWG` to the address `0x410127642C549A899E29182003A1e3F33422eB66`.