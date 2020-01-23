# Ethereum Lottery

This Ethereum SmartContract was the practical part of a paper I had to write for my bachelor's degree.

You can find the live version of this SmartContract on the [Ropsten Testnet](https://ropsten.etherscan.io/address/0x1f91c82Fe481A0A480d215e7e05a35e673E32aed#code).

### SmartContract

The SmartContract was written in Solidity, the Ethereum Virtual Machine (EVM) programming language.

Besides the usual getter functions, the user can buy tickets, draw the winner or withdraw its prize in case they won.

Once the first ticket was bought, the lottery begins automatically and ends after the chosen `roundDuration`. I choose 5 minutes for testing purposes.

This contract doesn't implement a secure RNG, as the Blockchain isn't a great source of entropy because of its deterministic nature.

See this note on the [Solidity Docs](https://solidity.readthedocs.io/en/v0.5.7/miscellaneous.html?highlight=randomness#global-variables) if want to learn more about it.

### Development

I used [Truffle](https://github.com/trufflesuite/truffle) and [Ganache](https://github.com/trufflesuite/ganache) to help me develop this SmartContract on a local Blockchain environment.

JavaScript was used for the Unit Test.
