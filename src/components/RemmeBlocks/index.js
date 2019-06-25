import React, { Component } from 'react';
import QueueAnim from 'rc-queue-anim';
import { Row, Col, Card, Icon } from 'antd';

import './style.css'

const Block = () => {
  return (
    <Col className="gutter-row" span={4}>
      <Card title="Card title" bordered={false}>
        Card content
      </Card>
    </Col>
  )
}

class RemmeBlocks extends Component {
  index = 0;
  state = {
    show: false,
    items: [],
    type: 'left',
  };

  componentDidMount() {
    const { wait } = this.props
    setTimeout(
      function() {
          this.setState({ show: true });
      }.bind(this)
    , wait);
  }

  componentDidUpdate(prevProps) {
    if (this.index != this.props.data[0].block_num) {
      this.index = this.props.data[0].block_num
      this.state.show && this.add();
    }
  }

  add = () => {
    let { items } = this.state;
    const { data } = this.props;

    if (!items[0]) {
      this.setState({ items: data, type: 'left' });
      return false;
    }

    const firstBlock = data[0].block_num
    const lastBlock = items[0].block_num

    for ( var i = 0; i < (firstBlock - lastBlock); i++ ) {
        items.pop();
    }
    this.setState({ items, type: 'right' });

    setTimeout(
        function() {
          this.setState({ items: data, type: 'right' });
        }.bind(this), 145 * (firstBlock - lastBlock));
  }

  render() {
    const {show} = this.state
    const {data} = this.props
    return (
      <React.Fragment>
        <h4>Blocks</h4>
        <Row className="blocks-row" gutter={30}>
          { show &&
            <QueueAnim type={this.state.type}>
              {this.state.items.map((item) =>
                <Col className="gutter-row" sm={24} md={12} lg={6} key={item.block_num}>
                  <Card className="block-item" title=<a><Icon type="code-sandbox" /> {item.block_num}</a> bordered={true}>
                    <span className="block-transactions">{item.transactions} Transactions</span>
                    <span className="block-producer">Producer: <a><b>{item.producer}</b></a></span>
                    <span className="block-time">{item.timestamp}</span>
                  </Card>
                </Col>
              )}
          </QueueAnim>}
        </Row>
      </React.Fragment>
    )
  }
}

export default RemmeBlocks;
