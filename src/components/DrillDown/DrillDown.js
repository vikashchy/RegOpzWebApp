import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'react-redux'
import {bindActionCreators, dispatch} from 'redux'
import {
  actionDrillDown
} from '../../actions/CaptureReportAction'
class DrillDownComponent extends Component {
  constructor(props){
    super(props);
    this.report_id = this.props.location.query['report_id'];
    this.sheet = this.props.location.query['sheet'];
    this.cell = this.props.location.query['cell'];
    this.drillDownResult = null;
  }
  componentWillMount(){
    this.props.drillDown(this.report_id,this.sheet,this.cell);
  }
  render(){
    this.drillDownResult = this.props.drill_down_result;
    if(this.drillDownResult == null){
      return(
        <h1>Loading...</h1>
      )
    }
    if(this.drillDownResult.agg_rules.length == 0 && this.drillDownResult.cell_rules.length == 0 && this.drillDownResult.comp_agg_rules.length == 0){
      return(
        <h1>No Data Found</h1>
      )
    } else {
      return(
        <div className="container">
        <div className="container">
          <table className="table">
            <thead>
              <tr>
                <th>Cell Formula</th>
              </tr>
            </thead>
            <tbody>
            {
              this.drillDownResult.comp_agg_rules.map((item,index) => {
                return(
                    <tr>
                      <td>{item.comp_agg_ref}</td>
                    </tr>
                )
              })
            }
            </tbody>
          </table>
        </div>
        <div className="container">
          <table className="table">
            <thead>
              <tr>
                <th>Cell Calculation Ref</th>
                <th>Data Source</th>
                <th>Aggregation Ref</th>
                <th>Aggregation function</th>
                <th>Cell Business Rules</th>
              </tr>
            </thead>
            <tbody>
            {
              this.drillDownResult.cell_rules.map((item,index) => {
                return(
                    <tr>
                      <td>{item.cell_calc_ref}</td>
                      <td>{item.source_id}</td>
                      <td>{item.aggregation_ref}</td>
                      <td>{item.aggregation_func}</td>
                      <td>{item.cell_business_rules}</td>
                    </tr>
                )
              })
            }
            </tbody>
            </table>
        </div>
        </div>
      );
    }
  }
}

function mapStateToProps(state){
  console.log("On map state", state);
  return{
    drill_down_result:state.captured_report.drill_down_result
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    drillDown:(report_id,sheet,cell) => {
      dispatch(actionDrillDown(report_id,sheet,cell));
    }
  }
}
const VisibleDrillDownComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(DrillDownComponent);
export default VisibleDrillDownComponent;