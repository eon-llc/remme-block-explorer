import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import QueueAnim from 'rc-queue-anim';
import { Tag, Icon, Button } from 'antd';

import { SmartLink } from '../../components'

class RemmeProducers extends Component {
  state = {
    show: false,
  }

  componentDidMount() {
    const {wait} = this.props
    setTimeout(
      function() {
          this.setState({ show: true });
      }.bind(this)
    , wait);
  }

  render() {
    const { show } = this.state;
    const { data, size, title, viewAll } = this.props;
    return (
      <React.Fragment>
        { show && <QueueAnim type="right">
        <h4>{title} {viewAll && <span style={{fontSize: 16, float: 'right'}}><SmartLink link='/producers'><Button style={{height: 34}} type="primary">View All</Button></SmartLink></span>}</h4>
        <div key="1" className="ant-table-wrapper">
         <div className="ant-spin-nested-loading">
            <div className="ant-spin-container">
               <div className="ant-table ant-table-default ant-table-scroll-position-left">
                  <div className="ant-table-content" style={{overflow: "hidden"}}>
                     <div className="ant-table-body">
                     <div className="scroll-table-1">
                      <div className="scroll-table-2">
                        <table className="">
                          <thead className="ant-table-thead">
                            <tr>
                              <th>
                                 <span className="ant-table-header-column">
                                    <div><span className="ant-table-column-title">#</span><span className="ant-table-column-sorter"></span></div>
                                 </span>
                              </th>
                               <th>
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Name</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               <th className="">
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Link</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               <th className="">
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Status</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               <th className="">
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Total votes</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               <th className="">
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Rate</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               <th className="">
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Rewards (per day)</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               <th className="">
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Unpaid blocks</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               {/*
                               <th className="">
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Signed blocks</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               <th className="">
                                  <span className="ant-table-header-column">
                                     <div><span className="ant-table-column-title">Expected blocks</span><span className="ant-table-column-sorter"></span></div>
                                  </span>
                               </th>
                               */}
                            </tr>
                          </thead>
                          <tbody className="ant-table-tbody">
                            {data.slice(0, size).map((item, index) =>
                              <tr className="ant-table-row ant-table-row-level-0" key={index} data-row-key={index}>
                                 <td className="">{ index + 1 }</td>
                                 <td className=""><Link to={'/account/' + item.owner}>{ item.owner }</Link></td>
                                 <td className=""><div className="producer-links">{item.url && <SmartLink link={item.url}><Icon type="link" /></SmartLink>}</div></td>
                                 <td className="">
                                  {item.tag === 'Active' && <Tag color="#4cd79c">Active</Tag>}
                                  {item.tag === 'Rotated' && <Tag color="#f9b22b">Rotated</Tag>}
                                  {item.tag === 'Standby' && <Tag color="#e7514c">Standby</Tag>}
                                 </td>
                                 <td className="">{item.total_votes.toFixed(0)}</td>
                                 <td className="">{ item.rate ? Number(item.rate.toFixed(4)) + '%' : '-'}</td>
                                 <td className="">{ item.rewards && item.rewards.toFixed(0)}</td>
                                 <td className="">{item.unpaid_blocks}</td>
                                 {/*
                                   <td className="">-</td>
                                   <td className="">-</td>
                                 */}
                              </tr>
                            )}
                          </tbody>
                        </table>
                        </div>
                     </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
        </div>
        </QueueAnim>
      }
      </React.Fragment>

    )
  }
}

export default RemmeProducers;
