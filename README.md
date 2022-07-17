# Introduction
This project is the tutorial from the udemy course blocktactoe if you are intered in that course you may visit udemy for more detail
Official demo is on https://tomw1808.github.io/blocktactoe/

# How To Run This Game
To run this game you and your opponent need access to the same blockchain. Either install MetaMask and choose the right network, or start your own blockchain node with go-ethereum or parity and connect to it.

# How To Install from the Repository

1. Install [Git](https://git-scm.com/downloads)
2. and [NodeJS](https://nodejs.org/en/download/) (including NPM) on Your Computer
3. Open a Terminal/Command Line and then `git clone https://github.com/tomw1808/blocktactoe.git"
4. `cd blocktactoe`
5. `npm install`
6. `npm install -g truffle`
7. `npm install -g ganache-cli`
8. Open Ganache: `ganache-cli`
9. Open a _second_ Terminal/Command Line in the same folder and type in
10. `truffle migrate` to deploy the smart contracts on Ganache
11. `npm run dev` to start the webpack dev server
12. Then open your browser