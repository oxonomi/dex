import { useSelector } from "react-redux";
import Chart from 'react-apexcharts';

import config from "../config.json";
import { priceChartSelector } from "../store/selectors";
import { options, datedDefaultSeries } from './PriceChart.config';
import arrowUp from '../assets/up-arrow.svg';
import arrowDown from '../assets/down-arrow.svg';


const PriceChart = () => {

    const chainId = useSelector(state => state.provider.chainId)
    const symbols = useSelector(state => state.tokens.symbols)
    const priceChart = useSelector(priceChartSelector)


    return (
      <div className="component exchange__chart">
        <div className='component__header flex-between'>
          <div className='flex'>
            <h2>{symbols.length ? `${symbols[0]}/${symbols[1]}` : 'OXO/GBPc'}</h2>
            {priceChart ? (
              <div className='flex'>
                {priceChart.lastPriceChange === '+' ? (
                <img src={arrowUp} alt="Arrow up" />
              ): (
                <img src={arrowDown} alt="Arrow down" />
              )}
                <span className='up'>{priceChart.lastPrice}</span>
              </div>
            ) : (
              <div className='flex'>
                <img src={arrowUp} alt="Arrow up" />
              </div>
            )}
          </div>
          {chainId !== "31337" && <a href={`${config[chainId].explorerURL}/address/${config[chainId].exchange.address}`} target="_blank" rel="noopener noreferrer">
            <button className="button button--sm">Etherscan</button>
          </a>}
        </div>
          <Chart
            type="candlestick"
            options={options}
            series={priceChart ? priceChart.series : datedDefaultSeries}
            width="100%"
            height="100%"
          />
      </div>
    );
  }

  export default PriceChart;
