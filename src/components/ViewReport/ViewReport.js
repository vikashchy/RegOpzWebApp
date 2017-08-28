import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators, dispatch } from 'redux';
import { Link } from 'react-router';
import _ from 'lodash';
import {
  //actionFetchDates,
  actionFetchReportCatalog,
  actionFetchReportLinkage,
  actionFetchDataChangeHistory,
  actionExportCSV,
  actionApplyRules,
} from '../../actions/ViewDataAction';
import {
  actionFetchReportData,
  actionDrillDown
} from '../../actions/CaptureReportAction';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import RegOpzReportGrid from '../RegOpzDataGrid/RegOpzReportGrid';
import RegOpzFlatGridActionButtons from '../RegOpzFlatGrid/RegOpzFlatGridActionButtons';
import ReportCatalogList from './ReportCatalogList';
import AuditModal from '../AuditModal/AuditModal';
import ModalAlert from '../ModalAlert/ModalAlert';
import DataReportLinkage from '../ViewData/DataReportLinkage';
import DefAuditHistory from '../AuditModal/DefAuditHistory';
import DrillDownRules from '../DrillDown/DrillDownRules';
import AddReportAggRules from '../MaintainReportRules/AddReportAggRules';
import ViewData from '../ViewData/ViewDataComponentV2';
import ViewBusinessRules from '../MaintainBusinessRules/MaintainBusinessRules';
require('react-datepicker/dist/react-datepicker.css');

class ViewReport extends Component {
  constructor(props){
    super(props)
    this.state = {
      startDate:moment().subtract(1,'months').format("YYYYMMDD"),
      endDate:moment().format('YYYYMMDD'),
      sources:null,
      itemEditable: true,
      reportId: null,
      reportingDate: null,
      businessDate: null,

      showDrillDownData: false,
      showAggRuleDetails: false,
      showDrillDownCalcBusinessRules: false,

      display: false
    }

    this.pages=0;
    this.currentPage=0;
    this.dataSource = null;
    this.calcRuleFilter = {};
    this.businessRuleFilterParam = {};
    this.selectedCell={};
    this.selectedItems = [];
    this.selectedIndexOfGrid = 0;
    this.form_data={};
    this.selectedViewColumns=[];
    this.operationName=null;
    this.buttons=[
      { title: 'Refresh', iconClass: 'fa-refresh', checkDisabled: 'No', className: "btn-primary", onClick: this.handleRefreshGrid.bind(this) },
      { title: 'Details', iconClass: 'fa-cog', checkDisabled: 'No', className: "btn-success", onClick: this.handleDetails.bind(this) },
      { title: 'History', iconClass: 'fa-history', checkDisabled: 'No', className: "btn-primary", onClick: this.handleHistoryClick.bind(this) },
      { title: 'Save Report Rules', iconClass: 'fa-puzzle-piece', checkDisabled: 'No', className: "btn-info", onClick: this.handleReportLinkClick.bind(this) },
      { title: 'Export', iconClass: 'fa-table', checkDisabled: 'No', className: "btn-success", onClick: this.handleExportCSV.bind(this) },
    ];
    this.buttonClassOverride = "None";

    this.renderDynamic = this.renderDynamic.bind(this);

    this.handleReportClick = this.handleReportClick.bind(this);
    this.handleDateFilter = this.handleDateFilter.bind(this);
    this.fetchDataToGrid = this.fetchDataToGrid.bind(this);
    this.checkDisabled = this.checkDisabled.bind(this);
    this.displaySelectedColumns = this.displaySelectedColumns.bind(this);
    this.handleCalcRuleClicked = this.handleCalcRuleClicked.bind(this);
    this.handleBusinessRuleClicked = this.handleBusinessRuleClicked.bind(this);
    this.handleAggeRuleClicked = this.handleAggeRuleClicked.bind(this);

    this.handleSelectCell = this.handleSelectCell.bind(this);
    this.handleSelectRow = this.handleSelectRow.bind(this);
    this.handleFullSelect = this.handleFullSelect.bind(this);
    this.handleUpdateRow = this.handleUpdateRow.bind(this);
    this.handleModalOkayClick = this.handleModalOkayClick.bind(this);
    this.handleAuditOkayClick = this.handleAuditOkayClick.bind(this);

    this.viewOnly = _.find(this.props.privileges, { permission: "View Report" }) ? true : false;
    this.writeOnly = _.find(this.props.privileges, { permission: "Edit Report" }) ? true : false;
  }

  componentWillMount(){
    //this.props.fetchDates(this.state.startDate ? moment(this.state.startDate).format('YYYYMMDD') : "19000101",this.state.endDate ? moment(this.state.endDate).format('YYYYMMDD') : "30200101", 'data_catalog');
    this.props.fetchReportCatalog(moment(this.state.startDate).format('YYYYMMDD') ,moment(this.state.endDate).format('YYYYMMDD') , 'Data');
  }
  componentDidUpdate(){
    console.log("Dates",this.state.startDate)
  }

  handleReportClick(item) {
    console.log("selected item",item);
    this.currentPage = 0;
    this.selectedViewColumns=[];
    this.setState({
        display: "showReportGrid",
        reportId: item.report_id,
        reportingDate: item.reporting_date,
        businessDate: item.as_of_reporting_date,
     },
      ()=>{this.props.fetchReportData(this.state.reportId,this.state.reportingDate);}
    );
  }

  handleDateFilter(dates) {
    this.setState({
      startDate: dates.startDate,
      endDate: dates.endDate
    },
      //since setState is asynchronus this gurantees that fetch is executed after setState is executed
      ()=>{this.props.fetchReportCatalog(this.state.startDate,this.state.endDate)}
    );
    // console.log("Dates",dates)
    // this.props.fetchSource(dates.startDate,dates.endDate,"Data");
  }
  checkDisabled(item){
    console.log("checkDisabled",item );
    switch (item){
      case "Add":
        return !this.writeOnly;
      case "Copy":
        return !this.writeOnly;
      case "Delete":
        return (!this.writeOnly || !this.state.itemEditable);
      default:
        console.log("No specific checkDisabled has been defined for ",item);
    }

  }

  displaySelectedColumns(columns) {
    var selectedColumns = [];
    for (let i = 0; i < columns.length; i++)
      if (columns[i].checked)
        selectedColumns.push(columns[i].name);

    this.selectedViewColumns = selectedColumns;
    //console.log(selectedColumns);
    //console.log(this.selectedViewColumns);
    this.setState({
      showReportLinkage: false,
      showHistory: false,
      showDrillDownRules: false,
    });
  }

  handleRefreshGrid(event){
    //this.selectedItems = this.flatGrid.deSelectAll();
    //this.currentPage = 0;
    this.setState({itemEditable:true});
    this.fetchDataToGrid(event);
  }


  fetchDataToGrid(event){
    this.props.fetchReportData(this.state.reportId,this.state.reportingDate);
  }

  handleDetails(event){
    //TODO
    let isOpen = this.state.display === "showDrillDownRules";
    if(isOpen){
      this.setState({
        display: "showReportGrid",
        showDrillDownData: false,
        showDrillDownCalcBusinessRules: false,
      });
    } else {
      //console.log("handleSelectCell",this.selectedCell.cell);
      if(!this.selectedCell.cell){
        this.modalAlert.isDiscardToBeShown = false;
        this.modalAlert.open("Please select a cell for details");
      } else {
        //this.buttons=this.dataButtons;
        this.setState({
          display: "showDrillDownRules",
          showDrillDownData: false,
          showDrillDownCalcBusinessRules: false,
          },
          this.props.drillDown(this.selectedCell.reportId,this.selectedCell.sheetName,this.selectedCell.cell)
        );
      }
    }

  }
  handleSelectCell(cell){
    console.log("handleSelectCell",cell);
    this.selectedCell = cell;
  }

  handleCalcRuleClicked(event,calcRuleFilter){
    console.log("Clicked calcRuleFilter",calcRuleFilter);
    this.calcRuleFilter = calcRuleFilter;
    this.setState({
        showDrillDownData : true,
        showDrillDownCalcBusinessRules : false,
        showAggRuleDetails: false
      });

  }

  handleBusinessRuleClicked(event,businessRuleFilterParam){
    console.log("Clicked ruleFilterParam",businessRuleFilterParam);
    this.businessRuleFilterParam = businessRuleFilterParam;
    this.setState({
        showDrillDownData : false,
        showDrillDownCalcBusinessRules : true,
        showAggRuleDetails: false
      });

  }

  handleAggeRuleClicked(event,item){
    console.log("Clicked ruleFilterParam",item);
    this.aggRuleData = item;
    // TODO AddReportAggRules as form and then pass aggRuleData
    this.setState({
        showDrillDownData : false,
        showDrillDownCalcBusinessRules : false,
        showAggRuleDetails: true
      });

  }

  handleSelectRow(indexOfGrid){
    console.log("Inside Single select....",this.selectedItems.length);
    if(this.selectedItems.length == 1){
      this.selectedIndexOfGrid = indexOfGrid;
      this.setState({itemEditable : (this.selectedItems[0].dml_allowed == "Y")});
      console.log("Inside Single select ", indexOfGrid);
    }

  }


  handleUpdateRow(row){
    this.operationName = "UPDATE";
    this.updateInfo = row;
    this.setState({ showAuditModal: true });
  }

  handleReportLinkClick() {
    let isOpen = this.state.display === "showReportLinkage";
    if(isOpen) {
      this.setState({
        display: "showReportGrid"
      });
    } else {
      if(this.selectedItems.length < 1){
        this.modalAlert.isDiscardToBeShown = false;
        this.modalAlert.open("Please select atleast one record");
      } else {
        let selectedKeys=null;
        this.selectedItems.map((item,index)=>{
          selectedKeys += (selectedKeys ? ',' + item.id : item.id)
        })
        this.props.fetchReportLinkage(this.state.sourceId,selectedKeys,this.state.businessDate);
        //console.log("Repot Linkage",this.props.report_linkage);
        this.setState({
          display: "showReportLinkage"
        });
      }
    }
    this.selectedItems = this.flatGrid.deSelectAll();
  }

  handleHistoryClick() {
    let isOpen = this.state.display === "showHistory";
    if(isOpen) {
      this.setState({
        display: "showReportGrid"
      });
    } else {
      let selectedKeys=null;
      this.selectedItems.map((item,index)=>{
        selectedKeys += (selectedKeys ? ',' + item.id : item.id)
      })
      this.props.fetchDataChangeHistory(this.props.gridDataViewReport.table_name,selectedKeys,this.state.businessDate);
      console.log("Repot Linkage",this.props.change_history);
      this.setState({
        display: "showHistory"
      });
    }
    this.selectedItems = this.flatGrid.deSelectAll();
  }

  handleExportCSV(event) {
    let business_ref = "_source_" + this.state.sourceId + "_COB_" + this.state.businessDate + "_";
    this.props.exportCSV(this.props.gridDataViewReport.table_name,business_ref,this.props.gridDataViewReport.sql);
  }

  handleFullSelect(items){
    console.log("Selected Items ", items);

    this.selectedItems = items;
    //this.props.setDisplayCols(this.props.gridDataViewReport.cols,this.props.gridDataViewReport.table_name);
    //this.props.setDisplayData(this.selectedItems[0]);

  }

  handleModalOkayClick(event){
    // TODO
  }

  handleAuditOkayClick(auditInfo){
    //TODO
  }

  renderDynamic(displayOption) {
      switch (displayOption) {
          case "showReportGrid":
              if (this.props.gridDataViewReport) {
                  return(
                      <div>
                          <RegOpzFlatGridActionButtons
                            editable={this.writeOnly}
                            checkDisabled={this.checkDisabled}
                            buttons={this.buttons}
                            dataNavigation={false}
                            pageNo={this.currentPage}
                            buttonClassOverride={this.buttonClassOverride}
                          />
                          <RegOpzReportGrid
                            report_id={this.state.reportId}
                            reporting_date={this.state.reportingDate}
                            gridData={this.props.gridDataViewReport}
                            handleSelectCell={ this.handleSelectCell.bind(this) }
                            ref={
                               (flatGrid) => {
                                 this.flatGrid = flatGrid;
                               }
                             }
                          />
                      </div>
                  );
              }
              return(
                  <div>
                    <h4>Loading ....</h4>
                  </div>
              );
          case "showDrillDownRules":
              if (this.props.cell_rules) {
                  let content = [
                      <DrillDownRules
                        cellRules = {this.props.cell_rules}
                        readOnly = {this.readOnly}
                        selectedCell = {this.selectedCell}
                        handleClose={ this.handleDetails.bind(this) }
                        reportingDate={this.state.reportingDate}
                        handleAggeRuleClicked={ this.handleAggeRuleClicked.bind(this) }
                        handleCalcRuleClicked={ this.handleCalcRuleClicked.bind(this) }
                        handleBusinessRuleClicked={ this.handleBusinessRuleClicked.bind(this) }
                      />
                  ];
                  if (this.state.showDrillDownData) {
                      content.push(
                          <ViewData
                            showDataGrid={true}
                            flagDataDrillDown={true}
                            sourceId={this.state.sourceId}
                            businessDate={this.state.businessDate}
                            dataFilterParam={this.calcRuleFilter}
                          />
                      );
                  } else if (this.state.showAggRuleDetails) {
                      content.push(
                          <AddReportAggRules
                            writeOnly={false}
                            handleClose={this.handleDetails.bind(this)}
                            {...this.aggRuleData}
                          />
                      );
                  } else if (this.state.showDrillDownCalcBusinessRules) {
                      content.push(
                          <ViewBusinessRules
                            showBusinessRuleGrid={true}
                            flagRuleDrillDown={true}
                            sourceId={this.businessRuleFilterParam.source_id}
                            ruleFilterParam={this.businessRuleFilterParam}
                          />
                      );
                  }
                  return content;
              }
              break;
          case "showReportLinkage":
              return(
                  <DataReportLinkage
                    data={ this.props.report_linkage }
                    ruleReference={ "" }
                    handleClose={ this.handleReportLinkClick.bind(this) }
                  />
              );
          case "showHistory":
              if (this.props.change_history) {
                  return(
                      <DefAuditHistory
                        data={ this.props.change_history }
                        historyReference={ "" }
                        handleClose={ this.handleHistoryClick.bind(this) }
                       />
                  );
              }
              break;
          default:
              return(
                  <ReportCatalogList
                    dataCatalog={this.props.dataCatalog}
                    navMenu={false}
                    handleReportClick={this.handleReportClick}
                    dateFilter={this.handleDateFilter}
                    applyRules={this.props.applyRules}
                    />
              );
      }
  }

  render(){
    if (typeof this.props.dataCatalog != 'undefined') {
        if (typeof this.props.gridDataViewReport != 'undefined' ){
          this.pages = Math.ceil(this.props.gridDataViewReport.count / 100);
        }
        return(
          <div>
            <div className="row form-container">
              <div className="x_panel">
                <div className="x_title">
                    {
                        ((displayOption) => {
                            if (displayOption) {
                                return(
                                    <h2>View Report <small>Available Reports for </small>
                                      <small>{moment(this.state.startDate).format("DD-MMM-YYYY") + ' - ' + moment(this.state.endDate).format("DD-MMM-YYYY")}</small>
                                    </h2>
                                );
                            }
                            return(
                                <h2>View Report <small>{' Report '}</small>
                                  <small><i className="fa fa-file-text"></i></small>
                                  <small>{this.state.reportId }</small>
                                  <small>{' as on Business Date: ' + moment(this.state.businessDate).format("DD-MMM-YYYY")}</small>
                                </h2>
                            );
                        })(this.state.display)
                    }
                      <div className="row">
                        <ul className="nav navbar-right panel_toolbox">
                          <li>
                            <a className="user-profile dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                              <i className="fa fa-rss"></i><small>{' Reports '}</small>
                              <i className="fa fa-caret-down"></i>
                            </a>
                            <ul className="dropdown-menu dropdown-usermenu pull-right" style={{ "zIndex": 9999 }}>
                              <li>
                                <Link to="/dashboard/view-report"
                                  onClick={()=>{ this.setState({ display: false }) }}
                                >
                                    <i className="fa fa-bars"></i>{' All Report List'}
                                </Link>
                              </li>
                              <li>
                                <a href="#"></a>
                                <ReportCatalogList
                                  dataCatalog={this.props.dataCatalog}
                                  navMenu={true}
                                  handleReportClick={this.handleReportClick}
                                  dateFilter={this.handleDateFilter}
                                  />
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    <div className="clearfix"></div>
                </div>
                <div className="x_content">
                {
                    this.renderDynamic(this.state.display)
                }
                </div>
            </div>
          </div>
          <ModalAlert
            ref={(modalAlert) => {this.modalAlert = modalAlert}}
            onClickOkay={this.handleModalOkayClick}
          />

          < AuditModal showModal={this.state.showAuditModal}
            onClickOkay={this.handleAuditOkayClick}
          />
        </div>
      );
    } else {
      return(
        <h4> Loading.....</h4>
      );
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchReportCatalog:(startDate,endDate)=>{
      dispatch(actionFetchReportCatalog(startDate,endDate))
    },
    fetchReportData:(report_id, reporting_date)=>{
      dispatch(actionFetchReportData(report_id, reporting_date))
    },
    drillDown:(report_id,sheet,cell) => {
      dispatch(actionDrillDown(report_id,sheet,cell));
    },
    fetchReportLinkage:(source_id,qualifying_key,business_date) => {
      dispatch(actionFetchReportLinkage(source_id,qualifying_key,business_date));
    },
    fetchDataChangeHistory:(table_name,id_list,business_date) => {
      dispatch(actionFetchDataChangeHistory(table_name,id_list,business_date));
    },
    exportCSV:(table_name,business_ref,sql) => {
      dispatch(actionExportCSV(table_name,business_ref,sql));
    },
    applyRules:(source_info) => {
      dispatch(actionApplyRules(source_info));
    },
  }
}

function mapStateToProps(state){
  console.log("On mapState ", state, state.view_data_store, state.report_store);
  return {
    //data_date_heads:state.view_data_store.dates,
    dataCatalog: state.report_store.reports,
    gridDataViewReport: state.captured_report,
    gridData: state.view_data_store.gridData,
    cell_rules: state.report_store.cell_rules,
    report_linkage:state.view_data_store.report_linkage,
    change_history:state.view_data_store.change_history,
    login_details:state.login_store,
  }
}

const VisibleViewReport = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewReport);

export default VisibleViewReport;
