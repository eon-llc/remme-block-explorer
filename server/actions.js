import { api, producerInfo } from "./helpers"
import { getInfo } from "./daemons"
import { getVoterInfo } from "./daemons/voters.daemon.js"

export const getBlock = async (id) => {
  try {
    return await api(`POST`,`chain`, `get_block`, `{"block_num_or_id":"${id}"}`);
  } catch (e) {
    console.log(e.message);
  }
}

export const getTransaction = async (id) => {
  try {
    return await api(`POST`,`history`, `get_transaction`, `{"id":"${id}"}`);
  } catch (e) {
    console.log(e.message);
  }
}

export const getActions = async (id, position) => {
  try {
    const from = position ? position : -1
    const offset = position ? -24 : -25
    return await api(`POST`,`history`, `get_actions`, `{"pos":"${from}","offset":"${offset}","account_name":"${id}"}`)
  } catch (e) {
    console.log(e.message);
  }
}

export const getSwapInfo= async (id) => {
  try {
    return await api(`POST`,`chain`, `get_table_rows`, `{ "json": true, "code": "${process.env.REACT_APP_SYSTEM_ACCOUNT}.swap", "scope": "${process.env.REACT_APP_SYSTEM_ACCOUNT}.swap", "table": "swaps", "limit": "500", "index_position": "secondary", "key_type": "sha256", "lower_bound": "${id}", "upper_bound": "${id}" }` );
  } catch (e) {
    console.log(e.message);
  }
}

export const getSwapFee= async () => {
  try {
    const swapInfo = await api(`POST`,`chain`, `get_table_rows`, `{ "json": true, "code": "${process.env.REACT_APP_SYSTEM_ACCOUNT}.swap", "scope": "${process.env.REACT_APP_SYSTEM_ACCOUNT}.swap", "table": "chains", "limit": "5" }` );
    console.log(swapInfo);
    return swapInfo.rows.filter(i => { return i.chain === process.env.REACT_APP_ETH_ENV_NAME });
  } catch (e) {
    console.log(e.message);
  }
}

export const getProducer = async (url) => {
  try {
    return await producerInfo(url + "/bp.json");
  } catch (e) {
    console.log(e ? e.message : null );
    return {}
  }
}

export const getVoters = async () => {
  try {
    return await api(`POST`,`chain`, `get_table_rows`, `{ "json": true, "code": "${process.env.REACT_APP_SYSTEM_ACCOUNT}", "scope": "${process.env.REACT_APP_SYSTEM_ACCOUNT}", "table": "voters", "limit": "500" }` );
  } catch (e) {
    console.log(e.message);
    return {}
  }
}

const round = (value, decimals) => {
 return Number(Math.round(value+`e`+decimals)+`e-`+decimals);
}

const calcBalance = (account, balance) => {
  let accInfo = {
    staked: 0,
    unstaked: 0,
    unstaking: 0,
    total_balance: 0,
    producerNotClimedRewards: 0,
    guardianNotClimedRewards: 0,
    balance: []
  };
  try {
    if (account && account.voter_info && account.voter_info.staked){
      accInfo.staked = account.voter_info.staked / process.env.REACT_APP_SYSTEM_COIN_DECIMAL;
    }
    accInfo.balance = Array.isArray(balance) ? balance : [];
    accInfo.balance.forEach((elem) => {
      if (elem.indexOf(process.env.REACT_APP_SYSTEM_COIN) !== -1){
        accInfo.unstaked = !isNaN(Number(elem.split(` `)[0])) ? Number(elem.split(` `)[0]) : 0;
      }
    });

    if (account.refund_request) {
      accInfo.unstaking = Number(account.refund_request.resource_amount.split(` `)[0])
    }

    const total_resources = Number(account.total_resources.cpu_weight.split(` `)[0]);
    const self_delegated_bandwidth = account.self_delegated_bandwidth ? (Number(account.self_delegated_bandwidth.cpu_weight.split(` `)[0]) ) : 0;
    accInfo.staked_by_others = round(total_resources - self_delegated_bandwidth, 4)
    accInfo.total_balance = round(accInfo.unstaked + accInfo.staked + accInfo.unstaking, 4)
    return accInfo;
  } catch (e) {
    console.log(e.message);
    return accInfo
  }
}

const normalizeAccount = (account) => {
  let regularAccount = account

  if (!regularAccount.total_resources) {
    regularAccount.total_resources = {
        "owner": account.account_name,
        "net_weight": "0 " + process.env.REACT_APP_SYSTEM_COIN,
        "cpu_weight": "0 " + process.env.REACT_APP_SYSTEM_COIN,
        "ram_bytes": 0
    }
    regularAccount.ram_quota = account.ram_usage;
    regularAccount.net_weight = 0;
    regularAccount.cpu_weight = 0;
    regularAccount.net_limit = {
        "used": 0,
        "available": 0,
        "max": 0
    }
    regularAccount.cpu_limit = {
      "used": 0,
      "available": 0,
      "max": 0
    }
  }

  if (!regularAccount.voter_info) {
    regularAccount.voter_info = {
      "pending_perstake_reward": 0,
      "producers": [],
      "last_undelegate_time": "1970-01-01T00:00:00.000",
      "last_reassertion_time": "1970-01-01T00:00:00.000",
      "stake_lock_time": "1970-01-01T00:00:00.000",
    }
  }

  return regularAccount;
}

export const getAccount = async (id) => {
  try {
    const chainInfo = getInfo();
    const marketChart = chainInfo.marketChart;
    let accountInfo = {};

    const account = await api(`POST`,`chain`, `get_account`, `{"account_name":"${id}"}`);

    accountInfo.account = account.account_name ? normalizeAccount(account) : false;

    const balanceInfo = await api(`POST`,`chain`, `get_currency_balance`, `{"code":"${process.env.REACT_APP_SYSTEM_ACCOUNT}.token", "account":"${id}"}`);
    accountInfo.balance = calcBalance(accountInfo.account, balanceInfo);
    accountInfo.balance.total_usd_value = Number(accountInfo.balance.total_balance * marketChart.prices[0].y)
    accountInfo.balance.guardianNotClimedRewards = accountInfo.account.voter_info.pending_perstake_reward / process.env.REACT_APP_SYSTEM_COIN_DECIMAL

    for (var i = 0; i < chainInfo.producers.length; i++){
      if (chainInfo.producers[i].owner === accountInfo.account.account_name){
         accountInfo.producer = chainInfo.producers[i];
         accountInfo.producer.position = i+1;
         accountInfo.balance.producerNotClimedRewards = accountInfo.producer.pending_pervote_reward / process.env.REACT_APP_SYSTEM_COIN_DECIMAL
         if (accountInfo.producer.unpaid_blocks != accountInfo.producer.expected_produced_blocks && accountInfo.producer.expected_produced_blocks > 0) {
              accountInfo.balance.producer_per_vote_pay = ((accountInfo.producer.pending_pervote_reward * accountInfo.producer.unpaid_blocks) / accountInfo.producer.expected_produced_blocks) / process.env.REACT_APP_SYSTEM_COIN_DECIMAL;
         }
      }
    }

    accountInfo.balance.NotClimedRewards_usd_value = Number((accountInfo.balance.producerNotClimedRewards + accountInfo.balance.guardianNotClimedRewards)  * marketChart.prices[0].y)
    const voter = getVoterInfo(accountInfo.account.account_name);
    if (voter.length) { accountInfo.account.voter_info = voter[0]; }
    if (accountInfo.producer) { accountInfo.producer.bp = await getProducer(accountInfo.producer.url); }
    return accountInfo
  } catch (e) {
    console.log(`\x1b[31m%s\x1b[0m`, `[ACTION getAccount] ERROR: `, e.message);
    return {}
  }
}
