import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies';

import config from '../config.json';
import { loadAccount, loadBalances, faucetTokens } from '../store/interactions';


const Faucet = ({ network }) => {

  const provider = useSelector(state => state.provider.connection)
  const chainId = useSelector(state => state.provider.chainId)
  const tokens = useSelector(state => state.tokens.contracts)
  const symbols = useSelector(state => state.tokens.symbols)
  const balances = useSelector(state => state.tokens.balances)
  const exchange = useSelector(state => state.exchange.contract)
  const account = useSelector(state => state.provider.account)

  const dispatch = useDispatch()


  const connectHandler = async () => {
    await loadAccount(provider, dispatch)
  }

  const faucetHandler = (e, token, symbol) => { //
        e.preventDefault()
        faucetTokens(token, symbol, provider, exchange, tokens, account, dispatch)
  }

  useEffect(() => {
      if (exchange && tokens[0] && tokens[1] && account) {
        loadBalances(exchange, tokens, account, dispatch)
      }
  }, [exchange, tokens, account, dispatch])


    return (
      <div>
        <h1>Use Faucet to receive trading tokens</h1>
        <br />
        <p>In order to test the exchange you will first need some OXO and GBPc tokens to trade with.</p>
        <br />
        <p>As these are fictitious tokens and not available anywhere else I have created a faucet function on the smart contract which you can call to receive OXO and GBPc  </p>
        <br />
        {account ? (
        <div>
            {network !== 0 ? (
              <div>
                {account ? (
                  <div>

                  <div className='flex-between'>
                    <p>Account Connected</p>
                    <a
                      href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`}
                      target='_blank'
                      rel='noreferrer'
                      style={{display:"flex", alignItems:"center"}}
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
                  <hr />
                    <div className='flex-between'>
                      <button className='button' style={{marginLeft:"0"}} onClick={ (e) => faucetHandler(e, tokens[0], symbols[0]) }>Send Me {symbols[0]}</button>
                      <div className='flex-apart'>
                        <p>{symbols && symbols[0]} Balance:{" "}</p>
                        <p style={{ color: balances ? (balances[0] === "0.0" ? "var(--clr-red)" : "var(--clr-green)") : ("var(--clr-white)") }}>
                            {balances ? (
                              balances[0] && Number(balances[0]) % 1 === 0
                              ? Number(balances[0]).toFixed(0)
                              : balances[0]
                            ):(
                              "0"
                            )}
                          </p>
                      </div>
                    </div>
                    <br />
                    <div className='flex-between'>
                      <button className='button' style={{marginLeft:"0"}} onClick={ (e) => faucetHandler(e, tokens[1], symbols[1]) }>Send Me {symbols[1]}</button>
                      <div className='flex-apart'>
                        <p>{symbols && symbols[1]} Balance:{" "}</p>
                        <p style={{ color: balances ? (balances[1] === "0.0" ? "var(--clr-red)" : "var(--clr-green)") : ("var(--clr-white)") }}>
                            {balances ? (
                              balances[1] && Number(balances[1]) % 1 === 0
                              ? Number(balances[1]).toFixed(0)
                              : balances[1]
                            ):(
                              "0"
                            )}
                          </p>
                      </div>
                    </div>
                    <br />
                    <br />
                    {balances ? (
                        balances[0] === "0.0" && balances[1] === "0.0" ? (
                          <div>
                          <p>Please use both faucets before continuing to the Deposit & Withdrawals tab </p>
                          <br />
                          <p>You can only call each faucet once per day</p>
                          <br />
                          <br />
                          <h2>If the faucet fails, please clear activity tab data in MetaMask</h2>
                          <p>
                          <small>{"MetaMask extension -> three dots (top-right) -> Settings -> Advanced -> Clear activity and nonce data"}</small><br />
                            <br />
                            This fixes the common RPC Error with MetaMask and Hardhat.
                          </p>
                        </div>
                      ):(
                        <div>
                          <p>With OXO and GBPc in your MetaMask wallet continue to the next tab to deposit the tokens from your your wallet to the dex.</p>
                          <br/>
                          <br/>
                          <p>You can only call each faucet once per day</p>
                          <br/>
                          <br/>
                          <br />
                          <hr />
                          <p>Incase you missed it:</p>
                          <h2>You can add token recognition for OXO and GBPc to see them in your MetaMask wallet</h2>
                          <p>
                            <small>{"MetaMask extension -> Tokens tab -> Import tokens "}</small><br />
                            <br />
                          </p>
                          {network === 'Sepolia' &&
                            <p>
                                OXO: <br /> {config[11155111].OXO.address} <br />
                                <br />
                                GBPc: <br /> {config[11155111].GBPc.address} <br />
                            </p>
                          }
                          {network === 'Mumbai' &&
                            <p>
                                OXO: <br /> {config[80001].OXO.address} <br />
                                <br />
                                GBPc: <br /> {config[80001].GBPc.address} <br />
                            </p>
                          }
                          {network === 'Hardhat' &&
                            <p>
                                OXO: <br /> {config[31337].OXO.address} <br />
                                <br />
                                GBPc: <br /> {config[31337].GBPc.address}<br />
                            </p>
                          }
                          <br />
                        </div>
                      )
                    ):(
                      ""
                    )}
                </div>
                ) : (
                  <div>
                    <hr />
                    <h2>4. &nbsp;&nbsp;Connect your wallet to the exchange</h2>
                    <br />
                    <button className='button' onClick={connectHandler}>Connect</button>
                  </div>
                )}
              </div>
              ) : (
              <div></div>
              ) }
        </div>
        ):(
        <div>
          <p style={{color:"rgb(255, 81, 81)"}}>To use the faucet, please connect your Wallet on the previous tab</p>
        </div>)}
      </div>
    );
  }

  export default Faucet;
