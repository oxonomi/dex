import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { makeBuyOrder, makeSellOrder } from "../store/interactions";
import { priceChartSelector } from "../store/selectors";


const Order = () => {

    const [isBuy, setIsBuy] = useState(true);
    const [amount, setAmount] = useState(0);
    const [price, setPrice] = useState(0);
    const [total, setTotal] = useState(0);
    const [buttonPressed, setButtonPressed] = useState(false);

    const buyRef = useRef(null)
    const sellRef = useRef(null)

    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const tokens = useSelector(state => state.tokens.contracts)
    const exchange = useSelector(state => state.exchange.contract)
    const symbols = useSelector(state => state.tokens.symbols)
    const priceChart = useSelector(priceChartSelector)

    const dispatch = useDispatch()


    useEffect(() => {
      setTotal(amount * price);
    }, [amount, price]);

    const tabHandler = (e) => {
        if (e.target.className !== buyRef.current.className){
          e.target.className = 'tab--small tab--active'
          buyRef.current.className = 'tab--small'
          setIsBuy(false)
        } else {
          e.target.className = 'tab--small tab--active'
          sellRef.current.className = 'tab--small'
          setIsBuy(true)
        }
      }

    const buyHandler = (e) => {
        e.preventDefault()
        makeBuyOrder(provider, exchange, tokens, {amount, price}, dispatch)
        setAmount(0)
        setPrice(0)
        setButtonPressed(true)
    }
    const sellHandler = (e) => {
        e.preventDefault()
        makeSellOrder(provider, exchange, tokens, {amount, price}, dispatch)
        setAmount(0)
        setPrice(0)
        setButtonPressed(true)
    }


    return (
      <div>
        <div className='flex-between'>
          <h1>Order</h1>
          <div className="flex">
            <h2>Trading pair:&nbsp;&nbsp;</h2>
            {<select name="pair" id="pairs" value={"OXO/GBPc"} readOnly>
                <option value="OXO/GBPc" >OXO / GBPc</option>
                <option value="0" disabled >OXO / USDC</option>
                <option value="0" disabled >GBPc / USDC</option>
                <option value="0" disabled >LINK / USDC</option>
              </select>}
          </div>
        </div>
        <br />
        <p>Make a limit order to {isBuy ? ("buy"):("sell")} OXO for GBPc.</p>
        <br />
        <ul style={{marginLeft:"18px"}}>
        <li>Set the quantity of OXO you want to {isBuy ? ("buy"):("sell")} </li>
        <li>Set your {isBuy ? ("buy"):("sell")} limit price for one OXO in GBPc</li>
        <li>Confirm the total and place the {isBuy ? ("buy"):("sell")} Order</li>
        </ul>
        <br />
        <br />
        <div className="component exchange__orders">
          <div className='component__header flex-between flex-between--DW'>
            <div className='tabs'>
              <button onClick={tabHandler} ref={buyRef} className='tab--small tab--active'>Buy</button>
              <button onClick={tabHandler} ref={sellRef} className='tab--small'>Sell</button>
            </div>
          </div>
          <br />
          <form className="order-form" onSubmit={ isBuy ? buyHandler : sellHandler }>
              {isBuy ? (
                  <label htmlFor="amount">Buy Quantity (OXO)</label>
              ) : (
                  <label htmlFor="amount">Sell Quantity (OXO)</label>
              )}
              <input style={{width:"50%", marginRight:"auto", marginLeft:"auto",marginTop:"10px"}}
                  type="text"
                  id='amount'
                  placeholder='e.g. 1'
                  value={amount === 0 ? '' : amount }
                  onChange={(e) => {
                    setAmount(e.target.value)
                  }}
              />
          <br />
              {isBuy ? (
                  <label htmlFor="Price">Buy Price (GBPc)</label>
              ) : (
                  <label htmlFor="Price">Sell Price (GBPc)</label>
              )}
              {priceChart.lastPrice && (<p><small>last buy price: {priceChart.lastPrice} GBPc</small></p>)}
              <input style={{width:"50%", marginRight:"auto", marginLeft:"auto"}}
                  type="text"
                  id='price'
                  placeholder={`e.g. ${(typeof priceChart.lastPrice === 'number' && !isNaN(priceChart.lastPrice)) ? priceChart.lastPrice : 69}`}
                  value={price === 0 ? '' : price }
                  onChange={(e) => {
                    setPrice(e.target.value)
                  }}
              />
               <br />
              <label>Total: {total} {symbols[1]}</label>
              <br />
              <button disabled={chainId === null} className='button' type='submit'>
              {isBuy ? (
                      <span>Create Buy Order</span>
                  ) : (
                      <span>Create Sell Order</span>
                  )}
              </button>
          </form>
        </div>
        <br />
        <br />
        {buttonPressed && (
          <p>Your order will be added to the order book where other users can accept the order and take the trade.</p>
        )}
      </div>
    );
  }

  export default Order;
