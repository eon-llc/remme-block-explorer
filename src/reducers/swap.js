import { START, CANCEL } from '../types';

const initialState = {};

const handleStart = (
  state,
  {
    SwapFinalize,
    SwapWait,
    SwapSignDigest,
    SwapID,
    SwapTransactionStatus,
    SwapSecret,
    SwapTransactionApproveStatus,
    SwapRawTransactionApprove,
    SwapTransactionApprove,
    SwapRawTransaction,
    SwapTransaction
  }) => ({
    SwapID,
    SwapSecret,
    SwapRawTransactionApprove,
    SwapTransactionApprove,
    SwapTransactionApproveStatus,
    SwapRawTransaction,
    SwapTransaction,
    SwapTransactionStatus,
    SwapSignDigest,
    SwapWait,
    SwapFinalize
  });

const handleCancel = () => initialState;

const handlers = {
  [START]: handleStart,
  [CANCEL]: handleCancel
};

export default (state = initialState, action) => {
  const handler = handlers[action.type];
  return handler ? handler(state, action.payload) : state;
};
