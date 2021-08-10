//import Web3 from 'web3';
import starNotaryArtifact from '../../build/contracts/StarNotary.json';
import detectEthProvider from '@metamask/detect-provider';
var Web3 = require("web3");

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function(provider) {
    const { web3 } = this;

    try {
      // get contract instance
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      this.account = accounts[0];
      this.web3 = new Web3(window.ethereum);
      const networkId = await ethereum.request({method: 'net_version'});
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new this.web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
        {from: this.account}
      );
      // get accounts
    } catch (error) {
      console.error(error);

    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  setStatus2: function(message) {
    const status = document.getElementById("status2");
    status.innerHTML = message;
  },

  createStr: async function() {
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    await this.meta.methods.createStar(name, id).send({from: this.account});
    this.setStatus("New Star Owner is " + this.account + ".");
    //await App.meta.methods.testMethodCall().send({from: App.account});
    //App.setStatus("New Star Owner is " + await App.meta.methods.createStar(name, id) + ".");
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function() {
    //const { lookUptokenIdToStarInfo } = this.meta.methods;
    const Id = document.getElementById("lookId").value;
    //const name = App.meta.methods.lookUptokenIdToStarInfo(Id);
    var res;
    await this.meta.methods.lookUptokenIdToStarInfo(Id).call({from: this.account})
    .then(function(result) { res = result; });

    this.setStatus2("This name of the star is: " + res);
    // });
  },


};

window.App = App;

window.addEventListener("DOMContentLoaded", async function() {
  const provider = await detectEthProvider();
  if (provider) {
    // use MetaMask's provider
    App.start(provider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});