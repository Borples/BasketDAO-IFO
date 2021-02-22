import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button, TextField, InputAdornment } from '@material-ui/core';

import Loader from '../loader';
import Snackbar from '../snackbar';

import Store from '../../stores';
import { colors } from '../../theme';

import { ERROR, STAKE, STAKE_RETURNED, WITHDRAW, WITHDRAW_RETURNED, GET_REWARDS, GET_REWARDS_RETURNED, EXIT, EXIT_RETURNED, GET_BALANCES_RETURNED } from '../../constants';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '600px',
    width: '100%',
    alignItems: 'center',
    margin: '0 auto 2rem',
  },
  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  overview: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: '28px 30px',
    borderRadius: '8px',
    border: '1px solid #DED9D5',
    marginTop: '40px',
    width: '100%',
    background: '#FBF6F0',
  },
  overviewField: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 5px',
  },
  overviewTitle: {
    color: colors.darkGray,
  },
  overviewValue: {},
  actions: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    background: '#FBF6F0',
    border: '1px solid #DED9D5',
    padding: '28px 30px',
    borderRadius: '8px',
    marginTop: '40px',
  },
  actionContainer: {
    minWidth: 'calc(50% - 40px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '20px',
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
  primaryButton: {
    color: '#fff',
    borderColor: '#000',
    background: '#000',
    fontWeight: '900',
    padding: '.1rem 2rem',
    minHeight: '4rem',
    minWidth: '14rem',
    borderRadius: '.5rem',
    '&:hover': {
      background: '#5A8F69',
    },
  },
  buttonText: {
    fontWeight: '700',
  },
  valContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  actionInput: {
    padding: '0px 0px 12px 0px',

    '& input': {
      fontSize: '1.2rem',
      borderBottom: '1px solid #DED9D5',
    },
  },
  inputAdornment: {
    fontWeight: '600',
    fontSize: '1.5rem',
  },
  assetIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderRadius: '25px',
    background: '#dedede',
    height: '30px',
    width: '30px',
    textAlign: 'center',
    marginRight: '16px',
  },
  balances: {
    width: '100%',
    textAlign: 'right',
    paddingRight: '20px',
    cursor: 'pointer',
  },
  stakeButtons: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    align: 'center',
    marginTop: '2rem',
  },
  requirement: {
    display: 'flex',
    alignItems: 'center',
  },
  check: {
    paddingTop: '6px',
  },
  voteLockMessage: {
    margin: '20px',
  },
  title: {
    color: '#000',
    marginBottom: '2rem',
    width: '100%',
    textAlign: 'center',
  },
});

const emitter = Store.emitter;
const dispatcher = Store.dispatcher;
const store = Store.store;

class Stake extends Component {
  constructor(props) {
    super();

    const account = store.getStore('account');
    const pool = store.getStore('currentPool');

    if (!pool) {
      props.history.push('/');
    }

    this.state = {
      pool: pool,
      loading: !(account || pool),
      account: account,
      value: 'options',
      voteLockValid: false,
      balanceValid: false,
      voteLock: null,
    };
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(STAKE_RETURNED, this.showHash);
    emitter.on(WITHDRAW_RETURNED, this.showHash);
    emitter.on(EXIT_RETURNED, this.showHash);
    emitter.on(GET_REWARDS_RETURNED, this.showHash);
    emitter.on(GET_BALANCES_RETURNED, this.balancesReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(STAKE_RETURNED, this.showHash);
    emitter.removeListener(WITHDRAW_RETURNED, this.showHash);
    emitter.removeListener(EXIT_RETURNED, this.showHash);
    emitter.removeListener(GET_REWARDS_RETURNED, this.showHash);
    emitter.removeListener(GET_BALANCES_RETURNED, this.balancesReturned);
  }

  calcUserPoolPercentage = () => {
    const { pool } = this.state;
    const tvl = pool.tokens[0].tvl;
    const staked = pool.tokens[0].stakedBalance ? pool.tokens[0].stakedBalance : 0;
    const poolPercentage = staked ? (staked * 100) / tvl : 0;
    return poolPercentage.toFixed(2);
  };

  calcDailyEarnings = () => {
    const { pool } = this.state;
    const { rewardRate } = pool.tokens[0];
    const dailyRewards = rewardRate * 86400;
    const userDailyRewards = (dailyRewards * this.calcUserPoolPercentage()) / 100;
    return userDailyRewards.toFixed(3);
  };

  balancesReturned = () => {
    const currentPool = store.getStore('currentPool');
    const pools = store.getStore('rewardPools');
    let newPool = pools.filter(pool => {
      return pool.id === currentPool.id;
    });

    if (newPool.length > 0) {
      newPool = newPool[0];
      store.setStore({ currentPool: newPool });
    }
  };

  showHash = txHash => {
    this.setState({
      snackbarMessage: null,
      snackbarType: null,
      loading: false,
    });
    const that = this;
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: txHash, snackbarType: 'Hash' };
      that.setState(snackbarObj);
    });
  };

  errorReturned = error => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null };
    this.setState(snackbarObj);
    this.setState({ loading: false });
    const that = this;
    setTimeout(() => {
      const snackbarObj = {
        snackbarMessage: error.toString(),
        snackbarType: 'Error',
      };
      that.setState(snackbarObj);
    });
  };

  render() {
    const { classes } = this.props;
    const { value, pool, loading, snackbarMessage } = this.state;

    if (!pool) {
      return null;
    }

    return (
      <div className={classes.root}>
        <div className={classes.intro}>
          <Button
            className={classes.actionButton}
            disabled={loading}
            onClick={() => {
              this.props.history.push('/staking');
            }}
          >
            Back
          </Button>
        </div>

        <div className={classes.overview}>
          <div className={classes.overviewLogo}>
            <img alt='' src={require('../../assets/' + pool.id + '-logo.png')} height='48px' />
          </div>

          <div className={classes.overviewField}>
            <Typography variant={'h3'} className={classes.overviewValue}>
              {pool.tokens[0].balance ? pool.tokens[0].balance.toFixed(2) : '0'} {pool.name}
            </Typography>
            <Typography variant={'h4'} className={classes.overviewTitle}>
              Your Balance
            </Typography>
          </div>
          <div className={classes.overviewField}>
            <Typography variant={'h3'} className={classes.overviewValue}>
              {pool.tokens[0].stakedBalance ? pool.tokens[0].stakedBalance.toFixed(2) : '0'}
            </Typography>
            <Typography variant={'h4'} className={classes.overviewTitle}>
              Currently Staked
            </Typography>
          </div>

          <div className={classes.overviewField}>
            <Typography variant={'h3'} className={classes.overviewValue}>
              {`${pool.tokens[0].rewardsAvailable.toFixed(3)} ${pool.tokens[0].rewardsSymbol}`}
            </Typography>
            <Typography variant={'h4'} className={classes.overviewTitle}>
              Rewards Available
            </Typography>
          </div>
        </div>

        <div className={classes.overview}>
          <div className={classes.overviewField}>
            <Typography variant={'h3'} className={classes.overviewValue}>
              {`${pool.tokens[0].tvl.toFixed()} ${pool.name}`}
            </Typography>
            <Typography variant={'h4'} className={classes.overviewTitle}>
              Total Value Locked
            </Typography>
          </div>
          <div className={classes.overviewField}>
            <Typography variant={'h3'} className={classes.overviewValue}>
              {`${this.calcUserPoolPercentage()}%`}
            </Typography>
            <Typography variant={'h4'} className={classes.overviewTitle}>
              Your Pool %
            </Typography>
          </div>
          <div className={classes.overviewField}>
            <Typography variant={'h3'} className={classes.overviewValue}>
              {`${this.calcDailyEarnings()} ${pool.tokens[0].rewardsSymbol}`}
            </Typography>
            <Typography variant={'h4'} className={classes.overviewTitle}>
              Current Daily Rate
            </Typography>
          </div>
        </div>

        {value === 'options' && this.renderOptions()}
        {value === 'stake' && this.renderStake()}
        {value === 'claim' && this.renderClaim()}
        {value === 'unstake' && this.renderUnstake()}
        {value === 'exit' && this.renderExit()}

        {snackbarMessage && this.renderSnackbar()}
        {loading && <Loader />}
      </div>
    );
  }

  renderOptions = () => {
    const { classes } = this.props;
    const { loading, pool } = this.state;

    return (
      <div className={classes.actions}>
        <div className={classes.actionContainer}>
          <Button
            className={classes.primaryButton}
            disabled={!pool.depositsEnabled || loading}
            onClick={() => {
              this.navigateInternal('stake');
            }}
          >
            Stake Tokens
          </Button>
        </div>
        <div className={classes.actionContainer}>
          <Button
            className={classes.primaryButton}
            disabled={loading}
            onClick={() => {
              this.onClaim();
            }}
          >
            Claim Rewards
          </Button>
        </div>
        <div className={classes.actionContainer}>
          <Button
            className={classes.primaryButton}
            disabled={loading}
            onClick={() => {
              this.navigateInternal('unstake');
            }}
          >
            Unstake Tokens
          </Button>
        </div>
        <div className={classes.actionContainer}>
          <Button
            className={classes.primaryButton}
            disabled={loading}
            onClick={() => {
              this.onExit();
            }}
          >
            Claim and Unstake
          </Button>
        </div>
      </div>
    );
  };

  navigateInternal = val => {
    this.setState({ value: val });
  };

  renderStake = () => {
    const { classes } = this.props;
    const { loading, pool } = this.state;

    const asset = pool.tokens[0];

    return (
      <div className={classes.actions}>
        <Typography className={classes.title} variant={'h3'}>
          Stake your tokens
        </Typography>
        {this.renderAssetInput(asset, 'stake')}
        <div className={classes.stakeButtons}>
          <Button
            className={classes.primaryButton}
            disabled={loading}
            onClick={() => {
              this.navigateInternal('options');
            }}
          >
            Back
          </Button>
          <Button
            className={classes.primaryButton}
            disabled={loading}
            onClick={() => {
              this.onStake();
            }}
          >
            Stake
          </Button>
        </div>
      </div>
    );
  };

  renderUnstake = () => {
    const { classes } = this.props;
    const { loading, pool } = this.state;

    const asset = pool.tokens[0];

    return (
      <div className={classes.actions}>
        <Typography className={classes.title} variant={'h3'}>
          Unstake your tokens
        </Typography>
        {this.renderAssetInput(asset, 'unstake')}
        <div className={classes.stakeButtons}>
          <Button
            className={classes.primaryButton}
            disabled={loading}
            onClick={() => {
              this.navigateInternal('options');
            }}
          >
            <Typography variant={'h4'}>Back</Typography>
          </Button>
          <Button
            className={classes.primaryButton}
            disabled={loading}
            onClick={() => {
              this.onUnstake();
            }}
          >
            Unstake
          </Button>
        </div>
      </div>
    );
  };

  overlayClicked = () => {
    this.setState({ modalOpen: true });
  };

  closeModal = () => {
    this.setState({ modalOpen: false });
  };

  onStake = () => {
    this.setState({ amountError: false });
    const { pool } = this.state;
    const tokens = pool.tokens;
    const selectedToken = tokens[0];
    const amount = this.state[selectedToken.id + '_stake'];

    // if(amount > selectedToken.balance) {
    //   return false
    // }

    this.setState({ loading: true });
    dispatcher.dispatch({
      type: STAKE,
      content: { asset: selectedToken, amount: amount },
    });
  };

  onClaim = () => {
    const { pool } = this.state;
    const tokens = pool.tokens;
    const selectedToken = tokens[0];

    this.setState({ loading: true });
    dispatcher.dispatch({
      type: GET_REWARDS,
      content: { asset: selectedToken },
    });
  };

  onUnstake = () => {
    this.setState({ amountError: false });
    const { pool } = this.state;
    const tokens = pool.tokens;
    const selectedToken = tokens[0];
    const amount = this.state[selectedToken.id + '_unstake'];
    //
    // if(amount > selectedToken.balance) {
    //   return false
    // }

    this.setState({ loading: true });
    dispatcher.dispatch({
      type: WITHDRAW,
      content: { asset: selectedToken, amount: amount },
    });
  };

  onExit = () => {
    const { pool } = this.state;
    const tokens = pool.tokens;
    const selectedToken = tokens[0];

    this.setState({ loading: true });
    dispatcher.dispatch({ type: EXIT, content: { asset: selectedToken } });
  };

  renderAssetInput = (asset, type) => {
    const { classes } = this.props;

    const { loading } = this.state;

    const amount = this.state[asset.id + '_' + type];
    const amountError = this.state[asset.id + '_' + type + '_error'];

    return (
      <div className={classes.valContainer} key={asset.id + '_' + type}>
        <div className={classes.balances}>
          {type === 'stake' && (
            <Typography
              variant='h4'
              onClick={() => {
                this.setAmount(asset.id, type, asset ? asset.balance : 0);
              }}
              className={classes.value}
              noWrap
            >
              {'Balance: ' + (asset && asset.balance ? (Math.floor(asset.balance * 10000) / 10000).toFixed(4) : '0.0000')} {asset ? asset.symbol : ''}
            </Typography>
          )}
          {type === 'unstake' && (
            <Typography
              variant='h4'
              onClick={() => {
                this.setAmount(asset.id, type, asset ? asset.stakedBalance : 0);
              }}
              className={classes.value}
              noWrap
            >
              {'Balance: ' + (asset && asset.stakedBalance ? (Math.floor(asset.stakedBalance * 10000) / 10000).toFixed(4) : '0.0000')} {asset ? asset.symbol : ''}
            </Typography>
          )}
        </div>
        <div>
          <TextField
            fullWidth
            disabled={loading}
            className={classes.actionInput}
            id={'' + asset.id + '_' + type}
            value={amount}
            error={amountError}
            onChange={this.onChange}
            placeholder='0.00'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end' className={classes.inputAdornment}>
                  <Typography variant='h3' className={''}>
                    {asset.symbol}
                  </Typography>
                </InputAdornment>
              ),
              startAdornment: (
                <InputAdornment position='end' className={classes.inputAdornment}>
                  <div className={classes.assetIcon}>
                    <img alt='' src={require('../../assets/' + asset.symbol + '-logo.png')} height='30px' />
                  </div>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>
    );
  };

  renderSnackbar = () => {
    var { snackbarType, snackbarMessage } = this.state;
    return <Snackbar type={snackbarType} message={snackbarMessage} open={true} />;
  };

  onChange = event => {
    let val = [];
    val[event.target.id] = event.target.value;
    this.setState(val);
  };

  setAmount = (id, type, balance) => {
    const bal = (Math.floor((balance === '' ? '0' : balance) * 10000) / 10000).toFixed(4);
    let val = [];
    val[id + '_' + type] = bal;
    this.setState(val);
  };
}

export default withRouter(withStyles(styles)(Stake));
