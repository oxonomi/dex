import { useSelector, useDispatch } from "react-redux";

import { orderBookSelector } from "../store/selectors";
import { fillOrder, cancelOrder } from "../store/interactions";
import { defaultOrderbookOrders } from "./PriceChart.config";


const OrderBook = () => {

    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)
    const exchange = useSelector(state => state.exchange.contract)
    const symbols = useSelector(state => state.tokens.symbols)
    let orderBook = useSelector(orderBookSelector)
    if (!orderBook) { orderBook = defaultOrderbookOrders; } //incase default JsonRpcProvider fails

    const dispatch = useDispatch()


    const fillOrderHandler = (order) => {
        if (order[1] === account) {
            if (window.confirm("You created this order! You can't fullfil your own order. To cancel your order press 'Cancel', to go back press 'Ok'") === true) {
              } else {
                cancelOrder(provider, exchange, order, dispatch)
              }
        } else {
            fillOrder(provider, exchange, order, dispatch)
        }
    }


    return (
      <div className="component exchange__orderbook">
        <div className='component__header flex-order-title'>
            <h2>Order Book</h2>
            <li>Click another users Ask order to buy</li>
            <li>Click another users Bid order to sell</li>
            <br />
        </div>
        <div className='orderbook-flex'>
            <div className='orderbook-flex-around'>
                <div>
                    <p>
                        Asks <br />
                        <small>(Other users selling)</small>
                    </p>
                </div>
                <div>
                    <p>
                        Bids <br />
                        <small>(Other users buying)</small>
                    </p>
                </div>
            </div>
            <div className="order-book">
            {!orderBook || orderBook.sellOrders.length === 0 ? (
                <p className="flex-center">No Sell Orders</p>
            ) : (
                <table className='exchange__orderbook--sell'>
                        <thead>
                            <tr>
                                <th>Price <br /> <small>({symbols.length ? symbols[1] : 'GBPc'})</small></th>
                                <th>Quantity<br /> <small>({symbols.length ? symbols[0] : 'OXO'})</small></th>
                                <th>Total<br /> <small>({symbols.length ? symbols[1] : 'GBPc'})</small></th>
                                <th style={{width:"50px"}}></th>
                            </tr>
                        </thead>
                    <tbody>
                        {orderBook && orderBook.sellOrders.map((order, index) => {
                            return (
                            <tr key={index} onClick={ () => { if (chainId !=null) { fillOrderHandler(order) }}}>
                                <td className='flex-between'>
                                    <p style={{ color: `${order.orderTypeClass}` }}>{order.tokenPrice}</p>
                                </td>
                                <td>
                                    {order.token0Amount && Number(order.token0Amount) % 1 === 0
                                    ? Number(order.token0Amount).toFixed(0)
                                    : order.token0Amount}
                                </td>
                                <td>
                                    {order.token1Amount && Number(order.token1Amount) % 1 === 0
                                    ? Number(order.token1Amount).toFixed(0)
                                    : order.token1Amount}
                                </td>
                                <td style={{width:"50px"}}>
                                    {order.user !== account ? (<button className="button button--sm">buy</button>) :(<p><small>-</small></p>)}
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        <div className='divider'></div>
            {!orderBook || orderBook.buyOrders.length === 0 ? (
                <p className='flex-center'>No Buy Orders</p>
            ) : (
                <table className='exchange__orderbook--buy'>
                    <tbody>
                        {orderBook && orderBook.buyOrders.map((order, index) => {
                            return (
                            <tr key={index} onClick={ () => { if (chainId !=null) { fillOrderHandler(order) }}}>
                                <td className='flex-between'>
                                    <p style={{ color: `${order.orderTypeClass}` }}>{order.tokenPrice}</p>
                                </td>
                                <td>
                                    {order.token0Amount && Number(order.token0Amount) % 1 === 0
                                    ? Number(order.token0Amount).toFixed(0)
                                    : order.token0Amount}
                                </td>
                                <td>
                                    {order.token1Amount && Number(order.token1Amount) % 1 === 0
                                    ? Number(order.token1Amount).toFixed(0)
                                    : order.token1Amount}
                                </td>
                                <td style={{width:"50px"}}>
                                    {order.user !== account ? (<button className="button button--sm">sell</button>) :(<p><small>-</small></p>)}
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
            </div>
        </div>
      </div>
    );
  }

  export default OrderBook;
