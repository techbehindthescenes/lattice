import { combineReducers } from 'redux';  
import PersonReducer from './reducer_person';  
import ToastReducer from './reducer_toast';

const rootReducer = combineReducers({  
  wantedList: PersonReducer,
  toast: ToastReducer
});

export default rootReducer;  