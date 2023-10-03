import { useState, useRef } from "react"

import OrderBook from "./OrderBook";
import Trades from "./Trades";


const OrderHistory = () => {

    const [showOrderBook, setShowOrderBook] = useState(true)

    const orderBookRef = useRef(null)
    const historyRef = useRef(null)


    const tabHandler = (e) => {
        if (e.target.className !== orderBookRef.current.className){
          e.target.className = 'tab--small tab--active'
          orderBookRef.current.className = 'tab--small'
          setShowOrderBook(false)
        } else {
          e.target.className = 'tab--small tab--active'
          historyRef.current.className = 'tab--small'
          setShowOrderBook(true)
        }
    }


    return (
      <div>
        <div className='order_history-flex'>
            <div className='tabs'>
                <button onClick={tabHandler} ref={orderBookRef} className='tab--small tab--active'>Order Book</button>
                <button onClick={tabHandler} ref={historyRef} className='tab--small'>History</button>
            </div>
        </div>
        {showOrderBook ? (
            <OrderBook />
        ) : (
            <Trades />
        )}
      </div>
    )
  }

  export default OrderHistory;
