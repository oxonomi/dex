import { createStore, combineReducers, applyMiddleware } from 'redux'; //update to toolkit in next update.
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Import Reducers
import { provider, tokens, exchange } from './reducers';

const reducer = combineReducers({
    provider,
    tokens,
    exchange
})

const initialState = {}

const middleware = [thunk]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store
