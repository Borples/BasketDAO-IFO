import React, { Component } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Switch, Route, Redirect } from 'react-router-dom';
import IpfsRouter from 'ipfs-react-router';

import './i18n';
import interestTheme from './theme';

import Account from './components/account';
import Stake from './components/stake';
import RewardsPools from './components/rewardPools';
import Layout from './components/layout';

import { CONNECTION_CONNECTED, CONNECTION_DISCONNECTED, CONFIGURE, CONFIGURE_RETURNED, GET_BALANCES_PERPETUAL, GET_BALANCES_PERPETUAL_RETURNED } from './constants';

import { injected } from './stores/connectors';

import Store from './stores';
const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

class App extends Component {
  state = {
    account: null,
    headerValue: null,
  };

  setHeaderValue = newValue => {
    this.setState({ headerValue: newValue });
  };

  componentWillMount() {
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(CONFIGURE_RETURNED, this.configureReturned);
    emitter.on(GET_BALANCES_PERPETUAL_RETURNED, this.getBalancesReturned);

    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        injected
          .activate()
          .then(a => {
            store.setStore({
              account: { address: a.account },
              web3context: { library: { provider: a.provider } },
            });
            emitter.emit(CONNECTION_CONNECTED);
          })
          .catch(e => {
            console.log(e);
          });
      } else {
      }
    });
  }

  componentWillUnmount() {
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(CONFIGURE_RETURNED, this.configureReturned);
    emitter.removeListener(GET_BALANCES_PERPETUAL_RETURNED, this.getBalancesReturned);
  }

  getBalancesReturned = () => {
    window.setTimeout(() => {
      dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} });
    }, 300000);
  };

  configureReturned = () => {
    dispatcher.dispatch({ type: GET_BALANCES_PERPETUAL, content: {} });
  };

  connectionConnected = () => {
    this.setState({ account: store.getStore('account') });
    dispatcher.dispatch({ type: CONFIGURE, content: {} });
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore('account') });
  };

  render() {
    const { account } = this.state;

    return (
      <MuiThemeProvider theme={createMuiTheme(interestTheme)}>
        <CssBaseline />
        <IpfsRouter>
          {!account && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                width: '100vw',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Account />
            </div>
          )}
          {account && (
            <Layout>
              <Switch>
                <Route path='/stake' component={Stake} />
                <Route path='/staking' component={RewardsPools} />
                <Route path='/'>
                  <Redirect to='/staking' />
                </Route>
              </Switch>
            </Layout>
          )}
        </IpfsRouter>
      </MuiThemeProvider>
    );
  }
}

export default App;
