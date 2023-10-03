import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { loadBalances, transferTokens } from '../store/interactions';
import oxo from '../assets/oxo.svg'
import GBPc from '../assets/GBPc.svg'


const Balance = () => {

    const [isDeposit, setIsDeposit] = useState(true)
    const [token1TransferAmount, setToken1TransferAmount] = useState(0)
    const [token2TransferAmount, setToken2TransferAmount] = useState(0)

    const depositRef = useRef(null)
    const withdrawRef = useRef(null)

    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)
    const exchange = useSelector(state => state.exchange.contract)
    const exchangeBalances = useSelector(state => state.exchange.balances)
    const transferInProgress = useSelector(state => state.exchange.transferInProgress)
    const tokens = useSelector(state => state.tokens.contracts)
    const symbols = useSelector(state => state.tokens.symbols)
    const tokenBalances = useSelector(state => state.tokens.balances)

    const dispatch = useDispatch()


    const tabHandler = (e) => {
      if (e.target.className !== depositRef.current.className){
        e.target.className = 'tab--small tab--active'
        depositRef.current.className = 'tab--small'
        setIsDeposit(false)
      } else {
        e.target.className = 'tab--small tab--active'
        withdrawRef.current.className = 'tab--small'
        setIsDeposit(true)
      }
    }

    const amountHandler = (e, token) => {
      if(token.address === tokens[0].address) {
        setToken1TransferAmount(e.target.value)
      } else {
        setToken2TransferAmount(e.target.value)
      }
    }

    const depositHandler = (e, token) => { //
      e.preventDefault() // prevents the default behavior of refreshing the page
      if(token.address === tokens[0].address) {
          transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
          setToken1TransferAmount(0)
      } else {
          transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch)
          setToken2TransferAmount(0)
      }
    }

    const withdrawHandler = (e, token) => { //
      e.preventDefault()
      if(token.address === tokens[0].address) {
        transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch)
        setToken1TransferAmount(0)
      } else {
        transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch)
        setToken2TransferAmount(0)
      }
    }

    useEffect(() => {
      if (exchange && tokens[0] && tokens[1] && account) {
          loadBalances(exchange, tokens, account, dispatch)
      }
    }, [account, transferInProgress, exchange, tokens, dispatch])


    return (
      <div className='component exchange__transfers'>
        <h1> Deposit tokens from your MetaMask Wallet to the Exchange</h1>
        <br />
        <p>
          After using the faucet you should now have a Wallet Balance for both OXO and GBPc tokens. Deposit these to the Exchange so you can trade. <br />
          <br />
        </p>
        <br />
        <br />
        <div className='component__header flex-between flex-between--DW'>
          <div className='tabs'>
            <button onClick={tabHandler} ref={depositRef} className='tab--small tab--active'>Deposit</button>
            <button onClick={tabHandler} ref={withdrawRef} className='tab--small'>Withdraw</button>
          </div>
        </div>
        <hr />
        <div className='exchange__transfers--form'>
        <div className='exchange__transfers--token'><h2>{symbols && symbols[0]}<img src={oxo} alt="Token Logo" /></h2></div>
        <br />
          <form className='exchange__transfer--container' onSubmit={isDeposit ? (e) => depositHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
            <div className='exchange__transfers--inline'>
              <div className='exchange__transfers--balances'>
                <p align="center">
                  Wallet Balance
                  <br />
                  <span style={{ color: tokenBalances ? (tokenBalances[0] === "0.0" ? "var(--clr-red)" : "var(--clr-green)") : ("var(--clr-white)") }}>
                            {tokenBalances ? (
                              tokenBalances[0] && Number(tokenBalances[0]) % 1 === 0
                              ? Number(tokenBalances[0]).toFixed(0)
                              : tokenBalances[0]
                            ):(
                              "0"
                            )}
                  </span>
                </p>
              </div>
              <div className='exchange__transfers--input'>
              <input
                  type="text"
                  id='token0'
                  placeholder='0'
                  value={token1TransferAmount === 0 ? '' : token1TransferAmount }
                  onChange={(e) => amountHandler(e, tokens[0])}
              />
              </div>
              <div className='exchange__transfers--balances'>
              <p align="center">
                Exchange Balance
                <br />
                <span style={{ color: exchangeBalances ? (exchangeBalances[0] === "0.0" ? "var(--clr-red)" : "var(--clr-green)") : ("var(--clr-white)") }}>
                            {exchangeBalances ? (
                              exchangeBalances[0] && Number(exchangeBalances[0]) % 1 === 0
                              ? Number(exchangeBalances[0]).toFixed(0)
                              : exchangeBalances[0]
                            ):(
                              "0"
                            )}
                  </span>
              </p>
              </div>
              </div>
              <br />
              <div className="flex">
              {isDeposit ? (
                <button className='button' type='submit' disabled={chainId === null}><span>Deposit to Exchange</span></button>
                ) : (
                  <button className='button button--left' type='submit' disabled={chainId === null}><span>Withdraw to Wallet</span></button>
                )}
              </div>
          </form>
        </div>
        <br />
        <hr />
        <div className='exchange__transfers--form'>
        <div className='exchange__transfers--token'><h2>{symbols && symbols[1]}<img src={GBPc} alt="Token Logo" /></h2></div>
                <br />
          <form className='exchange__transfer--container' onSubmit={isDeposit ? (e) => depositHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
            <div className='exchange__transfers--inline'>
              <div className='exchange__transfers--balances'>
                <p align="center">
                  Wallet Balance
                  <br />
                  <span style={{ color: tokenBalances ? (tokenBalances[1] === "0.0" ? "var(--clr-red)" : "var(--clr-green)") : ("var(--clr-white)") }}>
                            {tokenBalances ? (
                              tokenBalances[1] && Number(tokenBalances[1]) % 1 === 0
                              ? Number(tokenBalances[1]).toFixed(0)
                              : tokenBalances[1]
                            ):(
                              "0"
                            )}
                  </span>
                </p>
              </div>
              <div className='exchange__transfers--input'>
                <input
                    type="text"
                    id='token1'
                    placeholder='0'
                    value={token2TransferAmount === 0 ? '' : token2TransferAmount }
                    onChange={(e) => amountHandler(e, tokens[1])}
                />
              </div>
              <div className='exchange__transfers--balances'>
                <p align="center">
                  Exchange Balance
                  <br />
                  <span style={{ color: exchangeBalances ? (exchangeBalances[1] === "0.0" ? "var(--clr-red)" : "var(--clr-green)") : ("var(--clr-white)") }}>
                            {exchangeBalances ? (
                              exchangeBalances[1] && Number(exchangeBalances[1]) % 1 === 0
                              ? Number(exchangeBalances[1]).toFixed(0)
                              : exchangeBalances[1]
                            ):(
                              "0"
                            )}
                  </span>
                </p>
              </div>
            </div>
            <br />
            <div className='flex'>
            {isDeposit ? (
                <button className='button' type='submit' disabled={chainId === null}><span>Deposit to Exchange</span></button>
                ) : (
                <button className='button button--left' type='submit' disabled={chainId === null}><span>Withdraw to Wallet</span></button>
                )}
            </div>
          </form>
        </div>

        <hr />
        <br />
        <br />
        <p>
          Once you've deposited tokens from your Wallet to the Exchange you can continue to the next tab to make an order. <br />
          <br />
          You can also test the withdraw functionality on this page, but make sure you keep some tokens in the exchange for trading.</p>
      </div>
    );
  }

  export default Balance;
