import { combineReducers } from 'redux'
import loadingScreenReducer from './loadingScreenReducer'

export default combineReducers({
    loadingScreen: loadingScreenReducer
});