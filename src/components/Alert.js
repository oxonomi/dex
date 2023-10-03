import { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux";

import { myEventsSelector } from '../store/selectors';
import config from "../config.json";


const Alert = ( {activeTab} ) => {

    const [currentTransactionType, setCurrentTransactionType] = useState(null);

    const alertRef = useRef(null)

    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)
    const isPending = useSelector(state => state.exchange.transaction.isPending)
    const faucetIsPending = useSelector(state => state.tokens.faucet.isPending)
    const faucetIsError = useSelector(state => state.tokens.faucet.isError)
    const faucetIsSuccessful = useSelector(state => state.tokens.faucet.isSuccessful)
    const isError = useSelector(state => state.exchange.transaction.isError)
    const events = useSelector(myEventsSelector)


    const removeHandler = async (e) => {
        alertRef.current.className = 'alert alert--remove'
    }

    useEffect(() => {
        if((events[0] || faucetIsPending || isPending || isError) && account) {
            alertRef.current.className = 'alert'
        }
        if (faucetIsPending) {
            setCurrentTransactionType('faucet');
        }
        if (isPending) {
            setCurrentTransactionType('normal');
        }
    }, [faucetIsPending, isPending, isError, account, events])


    return (
        <div>
            { isPending || faucetIsPending ? (
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <p className="alert--x">x</p>
                    <h1>Transaction Pending...</h1>
                </div>

            ) : isError ? (

                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <p className="alert--x">x</p>
                    <h1>Transaction Will Fail</h1>
                    {activeTab === "PcOb" && <p>Ensure you have enough exchange balance</p>}
                </div>

            ) : (
            <>
                {currentTransactionType === 'faucet' && !faucetIsPending && faucetIsSuccessful ? (
                    <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                        <p className="alert--x">x</p>
                        <h1>Faucet Successful</h1>
                    </div>
                ) : currentTransactionType === 'normal' && !isPending && events[0] ? (
                    <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                        <p className="alert--x">x</p>
                        <h1>Transaction Successful</h1>
                        {chainId !== 31337 &&
                            <a
                                href={config[chainId] ? `${config[chainId].explorerURL}/tx/${events[0].transactionHash}` : '#'}
                                target='_blank'
                                rel='noreferrer'
                            >
                                {events[0].transactionHash.slice(0, 6) + '...' + events[0].transactionHash.slice(60, 66)}
                            </a>
                        }
                    </div>

                ) : faucetIsError ? (
                    <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                        <p className="alert--x">x</p>
                        <h1>Faucet Error</h1>
                        <p><small>You can only call the faucet once per day. / <br/>Try clearing activity tab in MetaMask</small></p>
                    </div>
                ) : currentTransactionType === null ? (
                    <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                        <p className="alert--x">x</p>
                        <h1>Account Connected</h1>
                    </div>
                ) : (
                    <div className="alert alert--remove" onClick={removeHandler} ref={alertRef} ></div>
                )}
            </>
            )}
        </div>
    );
  }

export default Alert;
