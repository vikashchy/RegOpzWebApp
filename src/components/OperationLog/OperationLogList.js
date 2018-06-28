import React, {Component} from 'react';
import {connect} from 'react-redux';


class OperationLogList extends Component{
  constructor(props){
    super(props);
    this.state = {showLogDetails: false};
    this.linkageData = this.props.data;
  }

  componentWillReceiveProps(nextProps){
      this.linkageData = nextProps.data;
  }


  render(){
    //console.log(this.state.showModal,this.props.showModal);
    return(
      <div className="x_panel">
        <div className="x_title">
          <h2>Operational Log<small> Time Line </small><small>historyReference</small></h2>
            <ul className="nav navbar-right panel_toolbox">
              <li>
                <a className="close-link" onClick={this.props.handleClose}><i className="fa fa-close"></i></a>
              </li>
            </ul>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <div>
          <div className="row">
          </div>
          <div className="clearfix"></div>
          </div>
          { this.renderOperationLog(this.linkageData)}
          </div>
      </div>
    );
  }

  renderOperationLog(linkageData){
      if(!linkageData || typeof(linkageData) == 'undefined' || linkageData == null) {
        return(
          <div>
            <h4>Loading operation logs .....</h4>
          </div>
        )
      }
      else if(linkageData.length == 0) {
        return(
          <div>
            <h4>No operational log found!</h4>
          </div>
        )
      }
      else{
        return(
          <table className="table table-content-wrap">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Start</th>
                <th>End</th>
                <th>Description</th>
                <th>User</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            {
              this.renderLogTable(this.linkageData)
            }
            </tbody>
          </table>
        );
      }
  }

  renderLogTable(linkageData){
    let logtable=[]
    linkageData.map(item=>{
      logtable.push(
        <tr
        title={this.state.showLogDetails ?
              "Click to hide log details"
              :
              "Click on the record to see log details"}
        onClick={
          (event)=>{
            this.setState({showLogDetails: !this.state.showLogDetails});
          }
        }
        >
          <td>{item.operation_type}</td>
          <td>{item.operation_start_time}</td>
          <td>{item.operation_start_time}</td>
          <td>{item.operation_narration}</td>
          <td>{item.operation_maker}</td>
          <td>{item.operation_status}</td>
        </tr>
      )
      if(this.state.showLogDetails){
        logtable.push(
          <tr>
            <td colSpan={6}>
              <div className="dashboard-widget-content">
                <ul className="list-unstyled timeline widget">
                {
                  item.log_details.map(detail=>(
                      <li>
                        <div className="block">
                          <div className="block_content">
                          <h2 className="title">{detail.operation_sub_type}</h2>
                          <div>
                            <span>{detail.operation_time}</span>
                            <span><strong>{" " + detail.operation_status}</strong></span>
                            <p className="excerpt">
                            {detail.operation_narration}
                            </p>
                          </div>
                        </div>
                        </div>
                      </li>
                    )
                  )
                }
                </ul>
              </div>
            </td>
          </tr>
          )
        }
    });

    return logtable;
  }

}

export default OperationLogList;
