import React, { Component } from 'react';
import { Spin, Icon  } from 'antd';

import { fetchBackend } from '../../functions/helpers'
import { RemmeGuardians } from '../../components';

const loadIcon = <Icon type="setting" rotate={180} style={{ fontSize: 24 }} spin />;

class Guardians extends Component {
  intervalID = 0;

  state = {
    loading: true,
    data: {},
  }

  handleUpdate = async () => {
    try {
      const json = await fetchBackend('getGuardians');
      if (!json.length) { return false }
      this.setState({
        loading: false,
        data: json
      });
    } catch (error) {
      this.setState({
        loading: true,
        data: {},
      });
    }
  }

  componentDidMount() {
    this.handleUpdate();
  }

  render() {
    const {loading, data} = this.state
    return (
      <React.Fragment>
        {!loading ? <RemmeGuardians data={data} wait={300} size={1000}/> : (
          <div className="preload-block">
            <Spin indicator={loadIcon} />
          </div>
        )}
      </React.Fragment>
    )
  }
}

export default Guardians;
