import React, {Component} from 'react';
import ReactDOM from 'react-dom';
export default class RegOpzDataGridHorizontalLines extends Component {
    constructor(props) {
        super(props);
        this.numberofRows = this.props.numberofRows;
        this.rowAttr = this.props.rowAttr
        this.style = {
            height:this.props.height,
            width:this.props.width
        }
    }
    componentWillReceiveProps(nextProps){
      console.log('inside componentWillReceiveProps horizontal row',nextProps.numberofRows)
      this.numberofRows = nextProps.numberofRows;
      this.rowAttr = nextProps.rowAttr;
      this.style = {
          height:nextProps.height,
          width:nextProps.width
      }
    }
    render(){
        console.log('inside render horizontal row',this.numberofRows)
        return(
          <div style={this.style} className="reg_horizontal_line_holder">
              {
                [... Array(parseInt(this.numberofRows))].map(function(item,index){
                    var stylex = {};
                    if(typeof(this.rowAttr[(index+1)+""]) != 'undefined') {
                      stylex.height = parseInt(this.rowAttr[(index+1)+""].height) * 2;
                    }
                    return (
                        <div key={index} style={stylex} className="reg_horizontal_line">
                            <div className="clearfix"></div>
                        </div>
                    )
                }.bind(this))
              }
          </div>
        )
    }
}
