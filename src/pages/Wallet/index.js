import React, { Component } from 'react';
import { Row, Col, Button, message, Card, Tabs } from 'antd';
import QueueAnim from 'rc-queue-anim';
import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import {JsonRpc, Api} from 'eosjs';

import { network } from '../../config.js'
import { RemmeSpin, RemmeResult, RemmeAccountInfo, RemmeResourcesInfo, CreateForm, TagsField } from '../../components'
import { walletTransfer, walletStake, walletVote } from '../../schemes';
import scatter from "../../assets/scatter.jpg";

const { TabPane } = Tabs;

ScatterJS.plugins( new ScatterEOS() );
const net = ScatterJS.Network.fromJson(network);
const rpc = new JsonRpc(net.fullhost());
const eos = ScatterJS.eos(net, Api, {rpc});

class Wallet extends Component {

  state = {
    producers: [],
    loading: false,
  }

  voteProducers = (tags) => {
    this.setState({ producers: tags });
  }

  initTransaction = (prefix, action_name, data) => {
    const {authority, name} = this.state;
    eos.transact({
        actions: [{
            account: `${network.account}${prefix}`,
            name: action_name,
            authorization: [{
                actor: name,
                permission: authority,
            }],
            data: data
        }]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
    }).then(res => {
        console.log('sent: ', res);
      message.success('Transaction Success, Please check your account page', 2);
    }).catch(err => {
      message.error(err.message, 2);
    });
  }

  handleTransaction = (e) => {
    const {name} = this.state;
    const form = this.form1;
    form.validateFields((err, values) => {
      if (err) { return; }
      const data = {
          from: name,
          to: values.account_name,
          quantity: Number(`${values.amount}`).toFixed(4) + ` ${network.coin}`,
          memo: values.memo,
      }
      form.resetFields();
      this.initTransaction('.token', 'transfer', data);
    });
  };

  handleVote = () => {
    const {producers} = this.state;
    const form = this.form4;
    form.validateFields((err, values) => {
      if (err) { return; }
      if (!producers || producers.length == 0) {
        message.error('Pls. Set producers.');
        return;
      }
      const data = {
          voter: values.voter,
          proxy: '',
          producers: producers
      }
      form.resetFields();
      this.setState({ producers: [] });
      this.initTransaction('', 'voteproducer', data);
    });
  }

  handleStake = (e) => {
    const {name} = this.state;
    const form = this.form2;
    form.validateFields((err, values) => {
      if (err) { return; }
      const data = {
          from: name,
          receiver: name,
          stake_quantity: values.amount,
          transfer: false,
      }
      form.resetFields();
      this.initTransaction('','delegatebw', data);
    });
  };

  handleUnstake = (e) => {
    const {name} = this.state;
    const form = this.form3;
    form.validateFields((err, values) => {
      if (err) { return; }
      const data = {
          from: name,
          receiver: name,
          unstake_quantity: values.amount,
          transfer: false,
      }
      form.resetFields();
      this.initTransaction('','undelegatebw', data);
    });
  };

  handleAccountInfo = async (name,authority) => {
    this.setState({ loading: true });
    try {
      const response = await fetch(`${network.backendAddress}/api/getAccount/${name}`);
      const json = await response.json();
      if (!json.account.account_name) {
        this.setState({
          error: "Account not found",
          loading: false
        });
      } else {
        this.setState({
          error: false,
          loading: false,
          raw: json,
          name: name,
          authority: authority
        });
      }
    } catch (error) {
      console.log(error.message);
      this.setState({
        error: "Account not found",
        loading: false
      });
    }
  }

  logout = () =>  {
    ScatterJS.scatter.forgetIdentity();
    ScatterJS.scatter.logout();
    window.location.reload(false);
  }

  login = () => {
    if (ScatterJS.account) {
      const account = ScatterJS.account('rem');
      console.log(account);
      if (account) {
        this.handleAccountInfo(account.name, account.authority);
      } else {
        this.logout();
      }
    } else {
      ScatterJS.connect(network.account, {net}).then(connected => {
        if(!connected) {
          return
        }
        ScatterJS.login({ accounts: [net]}).then(id => {
            if(!id) return console.error('no identity');
            const account = ScatterJS.account(network.blockchain);
            console.log(account);
            if (account) {
              this.handleAccountInfo(account.name, account.authority);
            } else {
              message.error('No accounts');
            }
        });
      });
    }


  }

  render() {
    const { raw, loading, error, producers } = this.state;
    return (
      <React.Fragment>
        { loading ? (<RemmeSpin/>) :
            error ? (<RemmeResult error={error} />) :
              raw ? (
                <React.Fragment>
                  <QueueAnim delay={300} interval={300} type="right" component={Row} gutter={30}>
                    <Col key="1">
                      <h4>Web Wallet:</h4>
                      <Card className="card-with-padding align-center" >
                        <Tabs defaultActiveKey="1">
                          <TabPane tab="Token transfer" key="1">
                            <h5>Transfer Tokens:</h5>
                            <CreateForm scheme={walletTransfer} ref={form => this.form1 = form}/>
                            <Button type="primary" onClick={this.handleTransaction}>Generate Transaction</Button>
                          </TabPane>
                          <TabPane tab="Stake Resources" key="2">
                            <h5>Stake:</h5>
                            <CreateForm scheme={walletStake} ref={form => this.form2 = form}/>
                            <Button type="primary" onClick={this.handleStake}>Generate Transaction</Button>
                          </TabPane>
                          <TabPane tab="Unstake Resources" key="3">
                            <h5>Unstake:</h5>
                            <CreateForm scheme={walletStake} ref={form => this.form3 = form}/>
                            <Button type="primary" onClick={this.handleUnstake}>Generate Transaction</Button>
                          </TabPane>
                          <TabPane tab="Vote" key="4">
                            <h5>Vote:</h5>
                            <div className="form-wit-tags-field">
                              <CreateForm scheme={walletVote} ref={form => this.form4 = form}/>
                              <p>Add producers:</p>
                              <TagsField onUpdate={this.voteProducers} tags={producers}/>
                            </div>
                            <Button type="primary" onClick={this.handleVote}>Generate Transaction</Button>
                          </TabPane>
                        </Tabs>

                      </Card>
                    </Col>
                  </QueueAnim>
                  <QueueAnim delay={900} interval={300} type="right" component={Row} gutter={30}>
                    <Col lg={24} xl={12} key="1">
                      <RemmeAccountInfo data={raw} forceUpdate={()=>{}}/>
                    </Col>
                    <Col lg={24} xl={12} key="2">
                      <RemmeResourcesInfo data={raw}/>
                    </Col>
                  </QueueAnim>
                  <QueueAnim delay={1500} interval={300} type="right" component={Row} gutter={30}>
                    <Col lg={24} xl={24} key="1" className="align-center">
                      <Button type="primary" onClick={this.logout}>Logout</Button>
                    </Col>
                  </QueueAnim>
                </React.Fragment>
              ) : (
                <QueueAnim delay={300} interval={300} type="right" component={Row} gutter={30}>
                  <Col className="align-center" key="1">
                    <Card className="card-with-padding" >
                      <h4>WEB Wallet</h4>
                      <p>Unlock wallet to start:</p>
                      <img className="image-button" onClick={this.login} src={scatter} alt=""/>
                    </Card>
                  </Col>
                </QueueAnim>
              )
        }
      </React.Fragment>
    );
  }
}

export default Wallet;