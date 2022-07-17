// import web3 from "web3";
// // // import metaCoinArtifact from "../../build/contracts/MetaCoin.json";
// import TicTacToeArtifact from "../../build/contracts/TicTacToe.json";
// import $ from "jquery";

import { default as Web3} from 'web3';
import TicTacToeArtifact from "../../build/contracts/TicTacToe.json";
import { default as contract } from 'truffle-contract'
import $ from "jquery";

var accounts;
var account;
var ticTacToeInstance;
var nextPlayerEvent;
var gameOverWithWinEvent;
var gameOverWithDrawEvent;
var arrEventsFired;


var TicTacToe = contract(TicTacToeArtifact);

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    // const { web3 } = this;

    try {

      var self = this;

      // Bootstrap the MetaCoin abstraction for Use.
      TicTacToeATicTacToertifact.setProvider(Web3.currentProvider);
  
      // Get the initial account balance so it can be displayed.
      Web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          alert("There was an error fetching your accounts.");
          return;
        }
  
        if (accs.length == 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }
  
        accounts = accs;
        account = accounts[0];
        arrEventsFired = [];
  
      });

      // // get contract instance
      // const networkId = await web3.eth.net.getId();
      // // const deployedNetwork = metaCoinArtifact.networks[networkId];
      // const deployedNetwork = TicTacToeArtifact.networks[networkId];
      // this.meta = new web3.eth.Contract(
      //   // metaCoinArtifact.abi,
      //   TicTacToeArtifact.abi,
      //   deployedNetwork.address,
      // );

      // // get accounts
      // const accounts = await web3.eth.getAccounts();
      // this.account = accounts[0];

      // this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  useAccountOne: function() {
    account = accounts[1];
  },

  createNewGame: function() {
    TicTacToe.new({from:account, value:Web3.toWei(0.1,"ether"), gas:3000000}).then(instance => {
      ticTacToeInstance = instance;

      console.log(instance);
      $(".in-game").show();
      $(".waiting-for-join").hide();
      $(".game-start").hide();
      $("#game-address").text(instance.address);
      $("#waiting").show();

      var playerJoinedEvent = ticTacToeInstance.PlayerJoined();

      playerJoinedEvent.watch(function(error, eventObj) {
        if(!error) {
          console.log(eventObj);
        } else {
          console.error(error);
        }
        $(".waiting-for-join").show();
        $("#opponent-address").text(eventObj.args.player);
        $("#your-turn").hide();
        playerJoinedEvent.stopWatching();

      });
      App.listenToEvents();
      console.log(instance);
    }).catch(error => {
      console.error(error);
    })
  },

  joinGame: function() {
    var gameAddress = prompt("Address of the Game");
    if(gameAddress != null) {
      TicTacToe.at(gameAddress).then(instance => {
        ticTacToeInstance = instance;

        App.listenToEvents();

        return ticTacToeInstance.joinGame({from:account, value:Web3.toWei(0.1, "ether"), gas:3000000});
      }).then(txResult => {
        $(".in-game").show();
        $(".game-start").hide();
        $("#game-address").text(ticTacToeInstance.address);
        $("#your-turn").hide();
        ticTacToeInstance.player1.call().then(player1Address => {
          $("#opponent-address").text(player1Address);
        })
        console.log(txResult);
      })
    }
  },

  listenToEvents: function() {
    nextPlayerEvent = ticTacToeInstance.NextPlayer();
    nextPlayerEvent.watch(App.nextPlayer);

    gameOverWithWinEvent = ticTacToeInstance.GameOverWithWin();
    gameOverWithWinEvent.watch(App.gameOver);

    gameOverWithDrawEvent = ticTacToeInstance.GameOverWithDraw();
    gameOverWithDrawEvent.watch(App.gameOver);
  },
  nextPlayer: function(error, eventObj) {
    if(arrEventsFired.indexOf(eventObj.blockNumber) === -1) {
      arrEventsFired.push(eventObj.blockNumber);
      App.printBoard();
      console.log(eventObj);

      if(eventObj.args.player == account) {
        //our turn
        /**
        Set the On-Click Handler
        **/
        for(var i = 0; i < 3; i++) {
          for(var j = 0; j < 3; j++) {
            if($("#board")[0].children[0].children[i].children[j].innerHTML == "") {
              $($("#board")[0].children[0].children[i].children[j]).off('click').click({x: i, y:j}, App.setStone);
            }
          }
        }
        $("#your-turn").show();
        $("#waiting").hide();
      } else {
        //opponents turn

        $("#your-turn").hide();
        $("#waiting").show();
      }

    }
  },

  gameOver: function(err, eventObj) {
    console.log("Game Over", eventObj);
    if(eventObj.event == "GameOverWithWin") {
      if(eventObj.args.winner == account) {
        alert("Congratulations, You Won!");
      } else {
        alert("Woops, you lost! Try again...");
      }
    } else {
      alert("That's a draw, oh my... next time you do beat'em!");
    }


    nextPlayerEvent.stopWatching();
    gameOverWithWinEvent.stopWatching();
    gameOverWithDrawEvent.stopWatching();

    for(var i = 0; i < 3; i++) {
      for(var j = 0; j < 3; j++) {
            $("#board")[0].children[0].children[i].children[j].innerHTML = "";
      }
    }

      $(".in-game").hide();
      $(".game-start").show();
  },

  setStone: function(event) {
    console.log(event);

    for(var i = 0; i < 3; i++) {
      for(var j = 0; j < 3; j++) {
        $($("#board")[0].children[0].children[i].children[j]).prop('onclick',null).off('click');
      }
    }

    ticTacToeInstance.setStone(event.data.x, event.data.y, {from: account}).then(txResult => {
      console.log(txResult);
      App.printBoard();
    })
  },

  printBoard: function() {
    ticTacToeInstance.getBoard.call().then(board => {
      for(var i=0; i < board.length; i++) {
        for(var j=0; j < board[i].length; j++) {
          if(board[i][j] == account) {
            $("#board")[0].children[0].children[i].children[j].innerHTML = "X";
          } else if(board[i][j] != 0) {
              $("#board")[0].children[0].children[i].children[j].innerHTML = "O";
          }
        }
      }
    });
  }

  // refreshBalance: async function() {
  //   const { getBalance } = this.meta.methods;
  //   const balance = await getBalance(this.account).call();

  //   const balanceElement = document.getElementsByClassName("balance")[0];
  //   balanceElement.innerHTML = balance;
  // },

  // sendCoin: async function() {
  //   const amount = parseInt(document.getElementById("amount").value);
  //   const receiver = document.getElementById("receiver").value;

  //   this.setStatus("Initiating transaction... (please wait)");

  //   const { sendCoin } = this.meta.methods;
  //   await sendCoin(receiver, amount).send({ from: this.account });

  //   this.setStatus("Transaction complete!");
  //   this.refreshBalance();
  // },

  // setStatus: function(message) {
  //   const status = document.getElementById("status");
  //   status.innerHTML = message;
  // },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
