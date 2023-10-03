import { useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux";

import { myOpenOrderSelector, myFilledOrderSelector } from "../store/selectors";
import { cancelOrder } from '../store/interactions'


const Transactions = () => {

    const [showMyOrders, setShowMyOrders] = useState(true)

    const provider = useSelector(state => state.provider.connection)
    const exchange = useSelector(state => state.exchange.contract)
    const symbols = useSelector(state => state.tokens.symbols)
    const myOpenOrders = useSelector(myOpenOrderSelector)
    const myFilledOrders = useSelector(myFilledOrderSelector)

    const dispatch = useDispatch()

    const tradeRef = useRef(null)
    const orderRef = useRef(null)


    const tabHandler = (e) => {
        if (e.target.className !== orderRef.current.className){
          e.target.className = 'tab--small tab--active'
          orderRef.current.className = 'tab--small'
          setShowMyOrders(false)
        } else {
          e.target.className = 'tab--small tab--active'
          tradeRef.current.className = 'tab--small'
          setShowMyOrders(true)
        }
    }

    const cancelHandler = (order) => {
        cancelOrder(provider, exchange, order, dispatch)

    }


    return (
      <div className="component exchange__transactions">
          {showMyOrders ? (
            <div>
            <div className='component__header flex-between'>
              <h2>My Orders</h2>
              <div className='tabs'>
                <button onClick={tabHandler} ref={orderRef} className='tab--small tab--active'>Orders</button>
                <button onClick={tabHandler} ref={tradeRef} className='tab--small'>Trades</button>
              </div>
            </div>
            {!myOpenOrders || myOpenOrders.length === 0 ? (
              <div>
                <br />
                <p>You have no open orders</p>
                <br />
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Quantity<br /><small>{symbols && symbols[0]}</small></th>
                    <th>Price<br/><small>({symbols[1]})</small></th>
                    <th>Total<br/><small>({symbols[1]})</small></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {myOpenOrders && myOpenOrders.map((order, index) => {
                      return (
                        <tr key={index}>
                          <td style={{color: `${order.orderTypeClass}`}}>
                            {order.orderType === 'buy' ? '+' :'-'}
                            {order.token0Amount && Number(order.token0Amount) % 1 === 0
                                    ? Number(order.token0Amount).toFixed(0)
                                    : order.token0Amount}
                            </td>
                          <td>{order.tokenPrice}</td>
                          <td style={{ color: `${order.orderType === 'buy' ? '#F45353' : '#25CE8F'}` }}>
                          {order.orderType === 'buy' ? '-' :'+'}
                            {order.token1Amount && Number(order.token1Amount) % 1 === 0
                                          ? Number(order.token1Amount).toFixed(0)
                                          : order.token1Amount}
                          </td>
                          <td><button className='button--sm' onClick={() => cancelHandler(order)}>Cancel</button></td>
                        </tr>
                      )
                  })}
                </tbody>
              </table>
            )}
            </div>
          ) : (
            <div>
            <div className='component__header flex-between'>
              <h2>My Trades</h2>
              <div className='tabs'>
                <button onClick={tabHandler} ref={orderRef} className='tab--small tab--active'>Orders</button>
                <button onClick={tabHandler} ref={tradeRef} className='tab--small'>Trades</button>
              </div>
            </div>
            {!myFilledOrders || myFilledOrders.length === 0 ? (
              <div>
                <br />
                <p>You have no completed trades</p>
                <br />
              </div>
            ) : (
            <table>
              <thead>
                <tr>
                <th>Time</th>
                <th>Quantity<br /><small>{symbols && symbols[0]}</small></th>
                <th>Price<br/><small>({symbols[1]})</small></th>
                <th>Total<br/><small>({symbols[1]})</small></th>
                </tr>
              </thead>
              <tbody>
              {myFilledOrders && myFilledOrders.map((order, index) => {

                return(
                  <tr key={index}>
                    <td>{order.formattedTimestamp}</td>
                    <td style={{ color: `${order.orderClass}` }}>
                      {order.orderSign}
                      {order.token0Amount && Number(order.token0Amount) % 1 === 0
                                    ? Number(order.token0Amount).toFixed(0)
                                    : order.token0Amount}
                    </td>
                    <td>{order.tokenPrice}</td>
                    <td style={{ color: `${order.orderClass === '#F45353' ? '#25CE8F' : '#F45353'}` }}>
                      {order.orderSign === '+' ? '-' : '+'}
                      {order.token1Amount && Number(order.token1Amount) % 1 === 0
                                    ? Number(order.token1Amount).toFixed(0)
                                    : order.token1Amount}
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
            )}
            </div>
          )}
      </div>
    )
  }

  export default Transactions;
