import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';
import { bindActionCreators, dispatch } from 'redux';
import RegOpzDataGridHeader from './RegOpzDataGridHeader';
import RegOpzDataGridSideMarker from './RegOpzGridSideMarker';
import RegOpzDataGridHorizontalLines from './RegOpzDataGridHorizontalLines';
import RegOpzDataGridVerticalLines from './RegOpzDataGridVerticalLines';
import RegOpzDataGridBody from './RegOpzDataGridBody';
require('./RegOpzDataGrid.css');

class RegOpzReportGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen:false,
      selectedSheet: 0,
      reRenDer: false,
    };
    this.numberofCols = 52;
    this.numberofRows = 1000;
    this.data = [];
    this.report_id = this.props.report_id;
    this.reporting_date = this.props.reporting_date;
    this.gridData = this.props.gridData;
    this.cell_format_yn = 'Y';
    this.selectedCell = {};
    this.selectedSheetName = null;
    this.gridHight = 0;
    this.gridWidth = 0;
    this.rulesIdAsSubQuery = "";
    this.linkageData = null;
    this.tabBody = null;
    this.renderTabs = this.renderTabs.bind(this);
    this.alphaSequence = this.alphaSequence.bind(this);
    this.handleResize = this.handleResize.bind(this);

    console.log('Inside Constructor');
    console.log(this.props.gridData);
    console.log(this.props.report_id);
  }

  componentWillReceiveProps(nextProps){
      //TODO
      console.log('Inside Receive Props');
      console.log(nextProps.gridData);
      console.log(nextProps.report_id);

      if(this.report_id != nextProps.report_id){
        this.setState({ selectedSheet: 0 });
      }
      this.gridData = nextProps.gridData;
      this.report_id = nextProps.report_id;
      this.reporting_date = nextProps.reporting_date;
      console.log("Inside componentWillReceiveProps reggrid",this.gridData)
  }

  alphaSequence(i) {
      return i < 0
          ? ""
          : this.alphaSequence((i / 26) - 1) + String.fromCharCode((65 + i % 26) + "");
  }

  render(){
    if (this.gridData.length > 0) {
      return(
        <div className="reg_gridHolder">
          <Tabs
            defaultActiveKey={0}
            activeKey={this.state.selectedSheet}
            onSelect={(key) => {
                this.setState({selectedSheet:key});
                //this.renderTabs(key);
                if (typeof this.props.handleSelectedSheet == 'function'){
                  let sheetDetail = {
                                      sheetIndex: key,
                                      reportId: this.report_id
                                    };
                  this.props.handleSelectedSheet(sheetDetail);
                }

            }}
            >
            {
              this.gridData.map((item,index) => {
                console.log("Inside dridData map");
                return(
                    <Tab
                      key={index}
                      eventKey={index}
                      title={item['sheet']}
                    >
                      {
                        (()=>{
                          if(this.state.selectedSheet == index){
                            // reseting the selectedCell when chanding the tab of the report
                            this.selectedCell = {};
                            this.props.handleSelectCell(this.selectedCell);
                            return (this.renderTabs(index));
                          }
                        })()
                      }
                    </Tab>
                )
              })
            }
          </Tabs>
      </div>
      )
    } else {
      return(
        <h4>Loading...</h4>
      )
    }
  }

  handleResize(item,value,elementType){
    console.log("Inside handleResize ", item,value,elementType);
    switch(elementType){
      case "row":
        this.gridData[this.state.selectedSheet].row_attr[item].height=value;
        break;
      case "column":
        this.gridData[this.state.selectedSheet].col_attr[item].width=value;
        break;
      default:
        break;
    }
    // This is to trigger refresh only, no other purpose
    this.setState({reRenDer: true});
  }

  renderTabs(index){
    //let index = this.state.selectedSheet;
    this.data = this.gridData[index].matrix;
    this.selectedSheetName = this.gridData[index]['sheet'];
    let row_attr = this.gridData[index].row_attr;
    let col_attr = this.gridData[index].col_attr;
    console.log('no of rows...', row_attr, row_attr.length);
    this.numberofRows = Object.keys(row_attr).length;
    this.numberofCols = Object.keys(col_attr).length;
    this.gridHight = 0;
    this.gridWidth = 0;
    [... Array(parseInt(this.numberofRows))].map(function(item,index){
        //var stylex = {};
        if(typeof(row_attr[(index+1)+""]) != 'undefined') {
          this.gridHight += parseInt(row_attr[(index+1)+""].height) * 2;
        }
    }.bind(this));
    [... Array(parseInt(this.numberofCols))].map(function(item,index){
        //var stylex = {};
        if(typeof(col_attr[this.alphaSequence(index)]) != 'undefined'){
          this.gridWidth += parseInt(col_attr[this.alphaSequence(index)]['width']) * 9 + 1;
        }
    }.bind(this));
    console.log('grid hight',this.gridHight);
    if( typeof this.props.audit_list != 'undefined' && this.props.audit_list.length ){
      this.linkageData = this.props.audit_list;
    }
    return(
      <div className="data_grid_container">
        <RegOpzDataGridHeader
          numberofCols={this.numberofCols}
          colAttr={this.gridData[index].col_attr}
          handleResize={this.handleResize}
        />
        <div className="clearfix"></div>
        <RegOpzDataGridSideMarker
          numberofRows={this.numberofRows}
          rowAttr={this.gridData[index].row_attr}
          handleResize={this.handleResize}
        />
        <div className="reg_grid_drawing_container">
            <RegOpzDataGridHorizontalLines
              numberofRows={this.numberofRows}
              height={this.gridHight}
              width={this.gridWidth}
              rowAttr={this.gridData[index].row_attr}
            />
            <RegOpzDataGridVerticalLines
              numberofCols={this.numberofCols}
              height={this.gridHight}
              width={this.gridWidth}
              colAttr={this.gridData[index].col_attr}
            />
            <RegOpzDataGridBody
              data={this.data}
              colAttr={this.gridData[index].col_attr}
              rowAttr={this.gridData[index].row_attr}
              cellStyle={this.gridData[index].cell_style}
              renderStyle={this.props.renderStyle}
              onSelect = {
                (item) => {
                  //console.log("item",item);
                  this.selectedCell = {
                    cell: item.cell,
                    value: item.value,
                    item: item.item,
                    sheetName: this.selectedSheetName,
                    reportId: this.report_id,
                    reportingDate: this.reporting_date,
                    multiSelect: item.multiSelect
                  };
                  //console.log("On select",this.selectedCell);
                  this.props.handleSelectCell(this.selectedCell);
                }
              }
              multiSelectAllowed={this.props.multiSelectAllowed}
            />
        </div>
      </div>
    );
  }
}

export default RegOpzReportGrid;
