import { useSelector } from "react-redux";

import { filledOrdersSelector } from "../store/selectors";
import Banner from "./Banner";


const Trades = () => {

    const symbols = useSelector(state => state.tokens.symbols)
    const filledOrders = useSelector(filledOrdersSelector)

    const Info = () => {
      window.confirm(`The discrepancy between timestamps of the Price Chart and the History is by design for this demo/development version. The trades in the History tab have the true timestamps and reflect all on-chain trades. The trades within the Price Chart have been altered to better reflect how a real Price Chart would appear on an active exchange.`)
    }


    return (
      <div className="component exchange__trades">
        <div className='component__header flex-between'>
          <h2>History of every trade</h2>
          <button className="i-btn" onClick={Info}>(<u>please note</u>)</button>
        </div>
      {!filledOrders || filledOrders.length === 0 ? (
        <div>
        <br />
        <Banner text={'No orders...'} />
        <p>Please connect to a testnet to see real orders</p>
        </div>
      ) : (
        <div>
          <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Quantity <br />({symbols && symbols[0]})</th>
              <th>Price <br /> ({symbols[1]})</th>
            </tr>
          </thead>
          <tbody>
            {filledOrders && filledOrders.map((order, index) => {

                return (
                    <tr key={index}>
                        <td>{order.formattedTimestamp}</td>
                        <td style={{color: `${order.tokenPriceClass}`}}>
                        {order.token0Amount && Number(order.token0Amount) % 1 === 0
                          ? Number(order.token0Amount).toFixed(0)
                          : order.token0Amount}
                        </td>
                        <td>{order.tokenPrice}</td>
                    </tr>
                )
            })}
          </tbody>
          </table>
        </div>
      )}
      </div>
    );
  }

  export default Trades;
