// <<< Imports
var Lottery = artifacts.require("Lottery");
const truffleAssert = require("truffle-assertions");
const time = require("openzeppelin-solidity/test/helpers/time");
const colors = require('colors');
// >>>
// <<< TimeTravel function
function increase(duration) {
  const id = Date.now();

  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1);

      web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id + 1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res);
      });
    });
  });
}
// >>>

contract(`Lottery`, function(accounts) {
    let roundDuration = 5*60 + 1;
    // let SIMULATION = false;
    let SIMULATION = true;

    // <<< before & after
    beforeEach(async() => {
        lottery = await Lottery.new({from: accounts[0]});
    });

    afterEach(async() => {
        await lottery.kill({from: accounts[0]});
    });

    // >>>
    if(!SIMULATION){
        // <<< buyTickets()

        it('buyTickets()', async() => {
            // Fehler -> You can only buy multiples of the ticket price.
            await truffleAssert.reverts(lottery.buyTickets({from: accounts[1], value: web3.utils.toWei(0.009, "ether")}));
            await truffleAssert.reverts(lottery.buyTickets({from: accounts[2], value: web3.utils.toWei(0.011, "ether")}));

            // Erfolg

        });

        // >>>
        // <<< drawWinner()
        it('drawWinner()', async() => {
            // Fehler --> No Tickets were bought yet.
            await truffleAssert.reverts(lottery.drawWinner());

            // Kaufe Tickets
            await lottery.buyTickets({from: accounts[1], value: web3.utils.toWei(0.4, "ether")});
            await lottery.buyTickets({from: accounts[2], value: web3.utils.toWei(0.1, "ether")});

            // Fehler --> The round didn't end yet.
            await truffleAssert.reverts(lottery.drawWinner());

            // Beende die Runde
            await send('evm_increaseTime', roundDuration);
            // await time.increase(5*60 + 1);
            // Erfolg
            await truffleAssert.passes(lottery.drawWinner());

            // Fehler --> Winner got already drawn!
            await truffleAssert.reverts(lottery.drawWinner());
        });
        // >>>
        // <<< withdrawPrize()
        it("withdrawPrize()", async() => {
            // Fehler --> You don't have anything to withdraw.
            await truffleAssert.reverts(lottery.withdrawPrize());

            // Kaufe Tickets
            await lottery.buyTickets({from: accounts[1], value: web3.utils.toWei(0.5, "ether")});
            await lottery.buyTickets({from: accounts[2], value: web3.utils.toWei(0.5, "ether")});

            // Fehler --> You don't have anything to withdraw.
            await truffleAssert.reverts(lottery.withdrawPrize());
            // Beende die Runde
            await time.increase(roundDuration);
            await lottery.drawWinner();

            // Fehler --> You don't have anything to withdraw.
            await truffleAssert.reverts(lottery.withdrawPrize({from: accounts[0]}));

            // Erfolg
            await truffleAssert.passes(lottery.withdrawPrize({from: await lottery.getCurrentWinner()}));

            // Fehler --> You don't have anything to withdraw.
            await truffleAssert.reverts(lottery.withdrawPrize({from: await lottery.getCurrentWinner()}));
        });
        // >>>
    } else {
        // <<< Full Round Simulations
        it(`simulate round`, async() => {
            for(let i=0; i<10; i++){
                // Spieler kaufen Tickets
                await truffleAssert.passes(lottery.buyTickets({from: accounts[1], value: web3.utils.toWei("1", "ether")}));
                await truffleAssert.passes(lottery.buyTickets({from: accounts[2], value: web3.utils.toWei("1", "ether")}));
                await truffleAssert.passes(lottery.buyTickets({from: accounts[3], value: web3.utils.toWei("1", "ether")}));
                await truffleAssert.passes(lottery.buyTickets({from: accounts[4], value: web3.utils.toWei("1", "ether")}));
                await truffleAssert.passes(lottery.buyTickets({from: accounts[5], value: web3.utils.toWei("1", "ether")}));

                // Beende die Runde
                await increase(roundDuration);
                // await web3.currentProvider.send('evm_increaseTime', roundDuration);

                // Gewinner Auslosung + Logging
                await truffleAssert.passes(lottery.drawWinner());
                winnerAddress = await lottery.getCurrentWinner();
                console.log(`Winner: ${accounts.indexOf(winnerAddress)}`.green.bold);
                lottery.getCurrentPrizeAmount().then(prize => console.log(`Prize: ${web3.utils.fromWei(prize)}`.green));

                // Gewinner hebt das Preisgeld ab
                await truffleAssert.passes(lottery.withdrawPrize({from: await lottery.getCurrentWinner()}));
                for (let i=1; i<=5; i++){
                    console.log(`Balance${i}: ${web3.utils.fromWei(await web3.eth.getBalance(accounts[i]), 'ether')}`);
                }
            }
        });
        // >>>
    }
});
