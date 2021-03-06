import { getNewBlockList } from './blocks.daemon.js'

let INITIAL_BLOCK = 0;
let TRANSACTION_LIST = [];

const checkTransaction = (transaction) => {
  if (typeof transaction.trx == "object") return true
  return false;
}

export const startTransactionsDaemon = async () => {
  const blocks = getNewBlockList();

  if (blocks.length && !INITIAL_BLOCK)
    INITIAL_BLOCK = blocks.pop().block_num;

  blocks.forEach(function(item) {
    try {
      TRANSACTION_LIST = item.transactions.filter(checkTransaction).concat(TRANSACTION_LIST);
    } catch (e) {

      console.log(e.message);
      console.log(item);
    }
    TRANSACTION_LIST = TRANSACTION_LIST.slice(0, 30);
  });
}

export const getTransactionList = () => {
  return TRANSACTION_LIST;
}
