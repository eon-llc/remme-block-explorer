import Web3 from 'web3';
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_ETH_INFURA_LINK));

export const newAccountValidator = (item, value, callback) => {

  if (value.length !== 12) {
    callback("must be 12 characters.");
  }

  // if (value.slice(11,12) === '.') {
  //   callback("Last character can't be '.'.");
  // }

  if (!/^[a-z1-5]*((-|\s)*[a-z1-5])*$/g.test(value)) {
    callback("[1-5][a-z] only");
  }
  //
  // if (value.slice(0,1) === '.') {
  //   callback("First character can't be '.'.");
  // }

  callback();
};

export const ethAddressValidator = async (item, value, callback) => {
  if(!value){
    callback("Please input ethereum address!");
  }
  else if(!await web3.utils.isAddress(value)){
    callback("Invalid ethereum address!");
  }
  callback();
};

export const ethTXValidator = async (item, value, callback) => {
  if(!value){
    callback("Please input ethereum transaction ID!");
  }

  if (!/^0x([A-Fa-f0-9]{64})$/g.test(value)) {
    callback("Transaction ID is invalid");
  }

  callback();
};

export const pubKeyValidator = (item, value, callback) => {

  if (value.length !== 53) {
    callback("Invalid Pub Key");
  }

  if (value.slice(0,3) !== 'EOS' && value.slice(0,3) !== 'REM' ) {
    callback("Invalid Pub Key");
  }

  callback();
};
