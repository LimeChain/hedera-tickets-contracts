# EventCo bonding contract

### Commands
* Compile ETH compatible contract - `npm run compile`
* Compile Hedera compatible contract - `npm run hedera-compile`
* Run ethereum chain - `npm run eth`
* Run contract tests - `npm run test`
* Deploy on Hedera - `npm run hedera-deploy`
* Run market simulation - `npm run simulation`

### Simulator
To simulate a huge amount of buying and reselling of tickets we prepared simulation script. This sript shows us changes of the **Sell Curve** and gives us a clear vision of how the ticket market could work in a reality. 

By increasing the number of resellers and refunders the Sell Curve goes down and down.

```
npm install
npm install -g etherlime

// Compile the contract
// Etherlime could throw because of contract verion 
// Increase it
npm run compile

// Start local blockchain
npm run eth

// Run the simulation
npm run simulation
```