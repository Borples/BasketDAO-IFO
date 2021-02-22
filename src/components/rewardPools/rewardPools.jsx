import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';

import UnlockModal from '../unlock/unlockModal.jsx';
import Store from '../../stores';
import { colors } from '../../theme';

import { CONFIGURE_RETURNED, GET_BALANCES, GET_BALANCES_RETURNED } from '../../constants';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    width: '100%',
    alignItems: 'center',
    margin: '0 auto',
  },
  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '400px',
  },
  introCenter: {
    minWidth: '100%',
    textAlign: 'center',
    padding: '48px 0px',
  },
  investedContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    minWidth: '100%',
    [theme.breakpoints.up('md')]: {
      minWidth: '800px',
    },
  },
  connectContainer: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '450px',
    [theme.breakpoints.up('md')]: {
      width: '450',
    },
  },
  buttonText: {
    fontWeight: '700',
    color: 'white',
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
  rewardPools: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  rewardPoolContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '260px',
    padding: '2rem 3rem',
    marginBottom: '2rem',
    border: '1px solid #DED9D5',
    borderRadius: '8px',
    background: '#FBF6F0',
  },
  title: {
    width: '100%',
    color: colors.darkGray,
    minWidth: '100%',
    marginLeft: '20px',
  },
  poolName: {
    paddingBottom: '.2rem',
    color: '#000',
  },
  poolLogo: {
    width: '16px',
    marginLeft: '-1rem',
    marginRight: '.5rem',
  },
  poolBrief: {
    color: '#A19C98',
    marginBottom: '20px',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
  contractLabel: {
    color: '#A19C98',
    paddingBottom: '20px',
  },
  contractAddress: {
    color: '#53AEA3',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
  actionButton: {
    color: '#fff',
    borderColor: '#000',
    background: '#000',
    fontWeight: '900',
    padding: '.1rem 2rem',
    '&:hover': {
      background: '#5A8F69',
    },
  },
});

const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

class RewardPools extends Component {
  constructor(props) {
    super();

    const account = store.getStore('account');
    const rewardPools = store.getStore('rewardPools');

    this.state = {
      rewardPools: rewardPools,
      loading: !(account && rewardPools),
      account: account,
    };

    dispatcher.dispatch({ type: GET_BALANCES, content: {} });
  }

  componentWillMount() {
    emitter.on(CONFIGURE_RETURNED, this.configureReturned);
    emitter.on(GET_BALANCES_RETURNED, this.balancesReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONFIGURE_RETURNED, this.configureReturned);
    emitter.removeListener(GET_BALANCES_RETURNED, this.balancesReturned);
  }

  balancesReturned = () => {
    const rewardPools = store.getStore('rewardPools');
    this.setState({ rewardPools: rewardPools });
  };

  configureReturned = () => {
    this.setState({ loading: false });
  };

  render() {
    const { classes } = this.props;
    const { modalOpen } = this.state;

    return (
      <div className={classes.root}>
        <Typography variant={'h5'} className={classes.disclaimer}>
          This project is in Beta. Use with caution and DYOR.
        </Typography>
        <div className={classes.rewardPools}>{this.renderRewards()}</div>
        {modalOpen && this.renderModal()}
      </div>
    );
  }

  renderRewards = () => {
    const { rewardPools } = this.state;

    return rewardPools.map(rewardPool => {
      return this.renderRewardPool(rewardPool);
    });
  };

  renderRewardPool = rewardPool => {
    const { classes } = this.props;

    var address = null;
    let addy = '';
    if (rewardPool.tokens && rewardPool.tokens[0]) {
      addy = rewardPool.tokens[0].rewardsAddress;
      address = addy.substring(0, 6) + '...' + addy.substring(addy.length - 4, addy.length);
    }

    return (
      <div className={classes.rewardPoolContainer} key={rewardPool.id}>
        <Typography variant="h3" className={classes.poolName}>
          <img alt={rewardPool.id} className={classes.poolLogo} src={require('../../assets/' + rewardPool.id + '-logo.png')} />
          {rewardPool.name}
        </Typography>
        <a href={rewardPool.link} target="_blank" rel="noopener noreferrer" className={classes.poolBrief}>
          {rewardPool.brief}
        </a>
        <Typography varian="h4" className={classes.contractLabel} align="center">
          Contract Address:
          <a href={`https://bscscan.com/address/${addy}`} target="_blank" rel="noopener noreferrer" className={classes.contractAddress}>
            {` ${address}`}
          </a>
        </Typography>
        <Button
          className={classes.actionButton}
          onClick={() => {
            if (rewardPool.tokens.length > 0) {
              this.navigateStake(rewardPool);
            }
          }}
        >
          Open
        </Button>
      </div>
    );
  };

  navigateStake = rewardPool => {
    store.setStore({ currentPool: rewardPool });

    this.props.history.push('/stake');
  };

  renderModal = () => {
    return <UnlockModal closeModal={this.closeModal} modalOpen={this.state.modalOpen} />;
  };

  overlayClicked = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };
}

export default withRouter(withStyles(styles)(RewardPools));
