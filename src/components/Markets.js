//no longer in use, may add in update
/*
import { useSelector, useDispatch } from 'react-redux';

import config from '../config.json';
import { loadTokens } from '../store/interactions'


const Markets = () => {

    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)

    const dispatch = useDispatch()


    const marketHandler = async (e) => {
        await loadTokens(provider, (e.target.value).split(','), dispatch)
    }


    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>
        { chainId && config[chainId] ? (
            <select name="markets" id="markets" onChange={marketHandler}>
                <option value={`${config[chainId].OXO.address},${config[chainId].GBPc.address}`}>OXO / GBPc</option>
                <option value={`${config[chainId].OXO.address},${config[chainId].dDAI.address}`}>OXO / dDAI</option>
            </select>
        ) : (
            <div>
                <p>Not deployed to network</p>
            </div>
        )}
        <hr />
      </div>
    )
  }

  export default Markets;
*/
