import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React from 'react'
import Wallet from './Wallet'
import Coins from './Coins'

import {
    SigningStargateClient
} from '@cosmjs/stargate'
import { MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";

import {
  Container,
  Button
} from 'react-bootstrap';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.chainId = process.env.REACT_APP_CHAIN_ID
    this.rpcUrl = process.env.REACT_APP_RPC_URL
    this.restUrl = process.env.REACT_APP_REST_URL
    this.state = {}
    this.connect = this.connect.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    window.onload = async () => {
      if (!window.keplr) {
        this.setState({isLoaded: true, error: 'Please install Keplr extension'})
      } else {
        this.connect()
      }
    }
    window.addEventListener("keplr_keystorechange", this.refresh)
  }

  componentWillUnmount() {
    window.removeEventListener("keplr_keystorechange", this.refresh)
  }

  async getBalance() {
    fetch(this.restUrl + "/cosmos/bank/v1beta1/balances/" + this.state.address)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            balance: result.balances.find(element => element.denom === 'uosmo') || {denom: 'uosmo', amount: 0}
          })
        },
        (error) => { }
      )
  }

  async refresh() {
    console.log('Refresh')
    this.connect()
  }

  async connect() {
    await window.keplr.enable(this.chainId);
    if (window.getOfflineSigner){
      const offlineSigner = window.getOfflineSigner(this.chainId)
      const accounts = await offlineSigner.getAccounts()

      const stargateClient = await SigningStargateClient.connectWithSigner(
        this.rpcUrl,
        offlineSigner
      )
      stargateClient.registry.register("/cosmos.authz.v1beta1.MsgGrant", MsgGrant)
      stargateClient.registry.register("/cosmos.authz.v1beta1.MsgRevoke", MsgRevoke)
      this.setState({
        address: accounts[0].address,
        stargateClient: stargateClient
      })
      this.getBalance()
    }
  }

  async disconnect(){
    this.setState({
      address: null,
      stargateClient: null
    })
  }

  render() {
    return (
      <Container>
        <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
          <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
            <span className="fs-4">REStake</span>
          </a>

          <ul className="nav nav-pills justify-content-end">
            {this.state.address &&
              <>
                <li className="nav-item">
                  <a className="nav-link disabled">{this.state.address} | <Coins coins={this.state.balance} /></a>
                </li>
                <li className="nav-item">
                  <a href="#" onClick={() => this.disconnect()} className="nav-link" aria-current="page">Disconnect</a>
                </li>
              </>
            }
          </ul>
        </header>
        {this.state.address &&
          <Wallet
            address={this.state.address}
            stargateClient={this.state.stargateClient} />
        }
        {!this.state.address &&
          <Button onClick={this.connect}>
            Connect
          </Button>
        }
      </Container>
    )
  }
}

export default App;
