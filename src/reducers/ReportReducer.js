import {FETCH_REPORT} from '../actions/DataGridAction';
export default function(state=[],action){
  console.log("Action received: ",action);
  switch(action.type){
    case 'FETCH_REPORT':
      return state.concat(action.payload)
    default:
      return state;

  }
}
