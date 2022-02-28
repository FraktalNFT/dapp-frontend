import { createStore, compose } from 'redux';

import rootReducer from '../redux/reducers/index';

let composeEnhancers = compose;
if (typeof window !== 'undefined') {
    composeEnhancers =
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const store = createStore(rootReducer, composeEnhancers());

export default store;
