//no longer in use, may add in update
/*
import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies';

import config from '../config.json';
import { loadAccount } from '../store/interactions';


const Wallet = ({ isLive, setIsLive }) => {

    const LiveRef = useRef(null)
    const LocalRef = useRef(null)

    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)

    const dispatch = useDispatch()


    const connectHandler = async () => {
        await loadAccount(provider, dispatch)
    }

    const tabHandler = (e) => {
        if (e.target.className !== LiveRef.current.className){
          e.target.className = 'tab--small tab--active'
          LiveRef.current.className = 'tab'
          setIsLive(false)
        } else {
          e.target.className = 'tab--small tab--active'
          LocalRef.current.className = 'tab'
          setIsLive(true)
        }
      }


    return (
        <div>
            <h1>Connect MetaMask wallet</h1>
            <br />
            <br />
            {!account ? (
            <div>
                <p>Connect your existing MetaMask wallet or <a href="https://metamask.io/" target="_blank" rel="noreferrer">create a new MetaMask wallet</a> Wallet</p>
                <p>Add Hardhat to MetaMask</p>
                <button className='button' onClick={connectHandler}>Connect</button>
            </div>
            ) : (
            <div>
                <div className='flex-between'>
                    <p>Account connected</p>
                    <a
                        href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`}
                        target='_blank'
                        rel='noreferrer'
                    >
                    {account.slice(0,5) + '...' + account.slice(-4)}
                    <Blockies
                        seed={account}
                        size={10}
                        scale={3}
                    className='identicon'
                    />
                    </a>
                </div>
                <br />
                <div className='my__flex-parent--left'>
                    <div style={{marginTop: "20px"}} className='tabs'>
                        <button onClick={tabHandler} ref={LiveRef} className={`tab--small ${isLive ? 'tab--active' : ''}`}>Live Testnet</button>
                        <button className='tab--small tab--disabled'>or</button>
                        <button onClick={tabHandler} ref={LocalRef} className={`tab--small ${!isLive ? 'tab--active' : ''}`}>Local</button>
                    </div>
                </div>
                <br />
                <h1>Continue settings up MetaMask</h1><br />
                <h2>1. &nbsp;&nbsp;Add Network to MetaMask </h2>
                <p>
                    <small>{"MetaMask extension -> Network drop-down (top-left) -> Add network -> Add manually"}</small>
                </p>
                <br />
                <br />
                {!isLive ? (
                    <div>
                        <table>
                        <tbody>
                            <tr>
                                <td>Network:</td>
                                <td>Hardhat</td>
                            </tr>
                            <tr>
                                <td>RPC URL:</td>
                                <td>http://127.0.0.1:8545/</td>
                            </tr>
                            <tr>
                                <td>ChainID:</td>
                                <td>31337</td>
                            </tr>
                            <tr>
                                <td>Symbol:</td>
                                <td>HardhatETH</td>
                            </tr>
                        </tbody>
                        </table>
                        <br />
                        <br />
                        <hr />
                        <h2>2. &nbsp;&nbsp;Import the account to your MetaMask wallet</h2>
                        <p>
                        <small>{"MetaMask extension -> Accounts drop-down -> Import account"}</small>
                        <br />
                        <br />
                        Private Key:<br /> 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6<br />
                        <small>(This is Account #3 from the Hardhat development console)</small>
                        </p>
                        <br />
                        <br />
                        <hr />
                        <h2>3. &nbsp;&nbsp;Clear activity tab data</h2>
                        <p>
                            <small>{"MetaMask extension -> three dots (top-right) -> Settings -> Advanced -> Clear activity and nonce data"}</small><br />
                            <br />
                            Prevents RPC Error common with MetaMask and Hardhat.
                        </p>
                        <br />
                        <hr />
                        <h2>4. &nbsp;&nbsp;Import the tokens to your MetaMask wallet</h2>
                    </div>
                 ) : (
                    <div>
                        <table>
                        <tbody>
                            <tr>
                                <td>Network:</td>
                                <td>Sepolia</td>
                                <td>Mumbai</td>
                            </tr>
                            <tr>
                                <td>RPC URL:</td>
                                <td>https://eth-sepolia.g.alchemy.com/v2/</td>
                                <td>https://polygon-mumbai.g.alchemy.com/v2/</td>
                            </tr>
                            <tr>
                                <td>ChainID:</td>
                                <td>11155111</td>
                                <td>80001</td>
                            </tr>
                            <tr>
                                <td>Symbol:</td>
                                <td>SepoliaETH</td>
                                <td>MumbaiMATIC</td>
                            </tr>
                        </tbody>
                        </table>
                        <br />
                        <hr />
                        <h2>2. &nbsp;&nbsp;Import the tokens to your MetaMask wallet</h2>
                    </div>
                 )}
                <p>
                <small>{"MetaMask extension -> Tokens tab -> Import tokens "}</small><br />
                  <br />
                  OXO: <br />0x5FbDB2315678afecb367f032d93F642f64180aa3<br />
                  <br />
                  GBPc: <br />0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512<br />
                </p>
                <br />
            </div>
            )}
        </div>
    );
  }

  export default Wallet;
*/
