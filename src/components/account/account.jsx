import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';

import UnlockModal from '../unlock/unlockModal.jsx';

import { ERROR, CONNECTION_CONNECTED, CONNECTION_DISCONNECTED, CONFIGURE_RETURNED } from '../../constants';

import Store from '../../stores';
const emitter = Store.emitter;
const store = Store.store;

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100vw',
    padding: '36px 24px',
  },
  connectHeading: {
    maxWidth: '300px',
    textAlign: 'center',
    color: '#000',
  },
  connectContainer: {
    padding: '20px',
  },
  actionButton: {
    color: '#fff',
    borderColor: '#000',
    background: '#000',
    '&:hover': {
      background: '#5A8F69',
    },
  },
  notConnectedRoot: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedRoot: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  address: {
    color: '#FF0',
    width: '100%',
    paddingBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  balances: {
    color: '#0ff',
    width: '100%',
    padding: '12px',
  },
  balanceContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
  accountHeading: {
    paddingBottom: '6px',
  },
  icon: {
    cursor: 'pointer',
  },
  disclaimer: {
    padding: '12px',
    border: '1px solid #F8F2EC',
    borderRadius: '0',
    background: '#F8F2EC',
    marginBottom: '2rem',
    fontWeight: 900,
    color: '#000',
  },
});

class Account extends Component {
  constructor(props) {
    super();

    const account = store.getStore('account');

    this.state = {
      loading: false,
      account: account,
      assets: store.getStore('assets'),
      modalOpen: false,
    };
  }
  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(CONFIGURE_RETURNED, this.configureReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(CONFIGURE_RETURNED, this.configureReturned);
  }

  connectionConnected = () => {
    // this.setState({ account: store.getStore('account') })
  };

  configureReturned = () => {
    // this.props.history.push('/')
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore('account'), loading: false });
  };

  errorReturned = error => {
    //TODO: handle errors
  };

  render() {
    const { classes } = this.props;
    const { modalOpen } = this.state;

    return (
      <div className={classes.root}>
        {this.renderNotConnected()}
        {modalOpen && this.renderModal()}
      </div>
    );
  }

  renderNotConnected = () => {
    const { classes } = this.props;
    const { loading } = this.state;

    return (
      <div className={classes.notConnectedRoot}>
        <Typography variant={'h5'} className={classes.disclaimer}>
          This project is in Beta. Use with caution and DYOR.
        </Typography>
        <div className={classes.connectHeading}>
          <Typography variant="h3">Connect your wallet to continue</Typography>
        </div>
        <div className={classes.connectContainer}>
          <Button className={classes.actionButton} onClick={this.unlockClicked} disabled={loading}>
            Connect
          </Button>
        </div>
      </div>
    );
  };

  renderModal = () => {
    return <UnlockModal closeModal={this.closeModal} modalOpen={this.state.modalOpen} />;
  };

  unlockClicked = () => {
    this.setState({ modalOpen: true, loading: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false, loading: false });
  };
}

export default withRouter(withStyles(styles)(Account));
