import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import Initiate from './components/Initiate'
import Redeem from './components/Redeem'
import Refund from './components/Refund'
import Check from './components/Check'

import AtomicSwap from '../build/contracts/AtomicSwap.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './css/pure-offsets.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null,
      account: "",
      instance: null
    };
  } 

  componentWillMount() {
    getWeb3
    .then(async results => {
      this.setState({
        web3: results.web3
      })

      await this.instantiateContract();
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  async instantiateContract() {
    const contract = require('truffle-contract')
    const atomicSwap = contract(AtomicSwap);
    atomicSwap.setProvider(this.state.web3.currentProvider)

    const accounts = await this.state.web3.eth.getAccounts();
    const instance = await atomicSwap.at("0x96ab491D858e9822B7682E0150D9537bd7C99357");
    
    this.setState({account: accounts[0], instance});
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="/" className="pure-menu-heading pure-menu-link">Lamden Atomic Swaps</a>
            <ul className="pure-menu-list navbar-right">
              <li className="pure-menu-item"><Link to="/" className="pure-menu-link">Initiate</Link></li>
              <li className="pure-menu-item"><Link to="/redeem" className="pure-menu-link">Redeem</Link></li>
              <li className="pure-menu-item"><Link to="/refund" className="pure-menu-link">Refund</Link></li>
              <li className="pure-menu-item"><Link to="/check" className="pure-menu-link">Check Swap</Link></li>
          </ul>
        </nav>

        <main className="container">
          <Route path="/" exact component={() => <Initiate {...this.state} />} />
          <Route path="/redeem" component={() => <Redeem {...this.state} />} />
          <Route path="/refund" component={() => <Refund {...this.state} />} />
          <Route path="/check" component={() => <Check {...this.state} />} />
        </main>
      </div>
    );
  }
}

export default App
