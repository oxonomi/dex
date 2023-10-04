import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies';

import config from '../config.json';
import {
    loadProvider,
    loadNetwork,
    loadAccount,
    loadTokens,
    loadExchange,
    loadAllOrders,
    subscribeToEvents,
} from "../store/interactions";


const Options = ({ network, setNetwork }) => {

    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)

    const dispatch = useDispatch()


    const changeTab = (e, tab) => {
        setNetwork(tab);
        const allTabs = Array.from(e.target.parentNode.childNodes); //put all tabs in an array to .find
        const activeTab = allTabs.find(tab => tab.classList.contains('tab--active'));
        if (activeTab) {
            activeTab.className = 'tab';
        }
        e.target.className = 'tab tab--active';
    }

    const loadBlockchainData = async () => {
        let newProvider = loadProvider(dispatch);
        let newChainId = await loadNetwork(newProvider, dispatch);

        const OXO = config[newChainId].OXO;
        const GBPc = config[newChainId].GBPc;
        const tokens = await loadTokens(newProvider, [OXO.address, GBPc.address], dispatch);

        //Load Exchange Smart Contract
        const exchangeConfig = config[newChainId].exchange;
        const exchange = await loadExchange(
            newProvider,
            exchangeConfig.address,
            dispatch
        );

        loadAllOrders(newProvider, exchange, dispatch);
        subscribeToEvents(exchange, tokens, dispatch);
    }

    const networkHandler = async (e) => {
        let switchChainId

        if (network === "Sepolia") { switchChainId = "0xaa36a7" }
        else if (network === "Mumbai") { switchChainId = "0x13881" }
        else if (network === "Hardhat") { switchChainId = "0x7a69" }

        try {
            await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: switchChainId }]
            })

            await loadBlockchainData();
            await loadAccount(provider, dispatch)
        } catch (error) {
            window.alert("Issue connecting to MetaMask wallet. Make sure MetaMask extension is enabled and the test network is configured correctly inside MetaMask. Reload the app and try again")
            console.error("An error occurred:", error);
        }
    }


    return (
        <div>
            <h1>Testing</h1>
            <br />
            <br />
            <p>Please select a a testnet</p>
            <br />
            <div className="flex-between">
                <div className="tabs">
                        <button onClick={(e) => changeTab(e, 'Sepolia')} className={network==='Sepolia' ? 'tab tab--active' : 'tab'}>Sepolia Testnet</button>
                        <button disabled style={{color:"grey"}} onClick={(e) => changeTab(e, 'Mumbai')} className={network==='Mumbai' ? 'tab tab--active' : 'tab'}>Mumbai Testnet</button>
                        <button onClick={(e) => changeTab(e, 'Hardhat')} className={network==='Hardhat' ? 'tab tab--active' : 'tab'}>Hardhat (Github/Docker)</button>
                </div>
            </div>
            {['Sepolia', 'Mumbai', 'Hardhat'].includes(network) && (
                <div>
                    <div>
                        <br />
                        <br />
                        <h2>1.&nbsp;&nbsp;Get the <a href="https://metamask.io/download" target="_blank" rel="noreferrer">MetaMask</a> Wallet</h2>
                        <br />
                        <ul>
                            <li>If you're new to MetaMask you can <a href="https://metamask.io/download" target="_blank" rel="noreferrer">download</a> the browser extension </li>
                            <li>Create a new account or use an existing one</li>
                        </ul>
                        <br />
                        <hr />
                        <h2>2.&nbsp;&nbsp; Add the Network to MetaMask</h2>
                        <div className="inner-card">
                        <p><small>{"MetaMask extension -> Network drop-down (top-left) -> "}{network === 'Sepolia' ? "Show test networks (toggle) -> select Sepolia." : "Add network -> Add a network manually"}</small></p>
                            {network === 'Sepolia' && (
                                <div>
                                    <br />
                                    Network, RPC URL, ChainID and Symbol will be added automatically for Sepolia, but if you want to add it manually use the table below.
                                </div>
                            )}
                        <br />
                        <table>
                            <tbody>
                                <tr>
                                    <td style={{width:"20%"}}>Network:</td>
                                    <td style={{textAlign:"left"}}>{network}</td>
                                </tr>
                                <tr>
                                    <td style={{width:"20%"}}>RPC URL:</td>
                                    <td style={{textAlign:"left"}}>
                                        {network === 'Sepolia' && "https://mainnet.infura.io/v3/"}
                                        {network === 'Mumbai' && "https://polygon-mumbai.g.alchemy.com/v2/"}
                                        {network === 'Hardhat' && "http://127.0.0.1:8545/"}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{width:"20%"}}>ChainID:</td>
                                    <td style={{textAlign:"left"}}>
                                        {network === 'Sepolia' && "11155111"}
                                        {network === 'Mumbai' && "80001"}
                                        {network === 'Hardhat' && "31337"}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{width:"20%"}}>Symbol:</td>
                                    <td style={{textAlign:"left"}}>
                                        {network === 'Sepolia' && "SepoliaETH"}
                                        {network === 'Mumbai' && "MumbaiMATIC"}
                                        {network === 'Hardhat' && "HardhatETH"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                    </div>
                    <br />
                    <hr />
                    {network === 'Sepolia' &&
                        <div>
                            <h2>3. &nbsp;&nbsp;Use the Sepolia Faucet</h2>
                            <div className="inner-card">
                                <p><small>To make transaction on the exchange you need SepoliaETH to pay gas on the Sepolia Testnet</small></p>
                            </div>
                            <br />
                            <ul>
                                <li>Sign-in or Sign-up to <a href="https://alchemy.com/" target="_blank" rel="noreferrer">Alchemy</a> </li>
                                <li>Go to <a href="https://sepoliafaucet.com/" target="_blank" rel="noreferrer">Sepolia Faucet</a> and sign-in with you Alchemy account</li>
                                <li>Enter your MetaMask account public key and click 'Send Me ETH'. This will send you some SopoliaETH which is used to pay gas on the Sepolia Ethereum testnet. </li>
                            </ul>
                        </div>
                    }
                    {network === 'Mumbai' &&
                        <div>
                            <h2>3. &nbsp;&nbsp;Use the Mumbai Faucet</h2>
                            <br />
                            <ul>
                                <li>Sign-in or Sign-up to <a href="https://alchemy.com/" target="_blank" rel="noreferrer">Alchemy</a> </li>
                                <li>Got to <a href="https://mumbaifaucet.com/" target="_blank" rel="noreferrer">Mumbai Faucet</a> and sign-in with you Alchemy account</li>
                                <li>Enter your MetaMask account public key and click 'Send Me MATIC'. This will send you some MumbaiMATIC which is used to pay gas on the Mumbai Polygon testnet. </li>
                            </ul>
                        </div>
                    }
                    {network === 'Hardhat' &&
                        <div>
                            <h2>3. &nbsp;&nbsp;Import a Hardhat account to your MetaMask wallet</h2>
                            <div className="inner-card">
                            <p><small>{"MetaMask extension -> Accounts drop-down -> Import account"}</small></p>
                            <br />
                                <p>
                                    Private Key:<br /> 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6<br />
                                    <small>(This is Account #3 from the Hardhat development console)</small>
                                </p>
                            </div>
                        </div>
                    }
                    <br />
                    <hr />
                    <h2>4. &nbsp;&nbsp;Add token recognition in MetaMask for OXO and GBPc tokens</h2>
                    <div className="inner-card">
                    <p><small>{"MetaMask extension -> Tokens tab -> Import tokens "}</small><br /></p>
                    <br />
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
                    </div>
                    <br />
                    <hr />
                    {network === 'Hardhat' &&
                    <div>
                        <h2>5. &nbsp;&nbsp;Clear activity tab data</h2>
                        <div className="inner-card">
                            <p><small>{"MetaMask extension -> three dots (top-right) -> Settings -> Advanced -> Clear activity and nonce data"}</small><br /></p>
                            <br />
                            <p>Prevents RPC Error common with MetaMask and Hardhat.</p>
                        </div>
                        <br />
                        <hr />
                        <h2>6. &nbsp;&nbsp; Download and run the project locally</h2>
                        <br/>
                        <ul>
                            <li>
                                Download the repository from my <a href="https://github.com/Eternal-Instant/dex" target="_blank" rel="noreferrer">Github</a>
                                <p>or</p>
                                <p className="code-wrapper"><span className="code"> $ git clone https://github.com/oxonomi/dex</span> </p>
                            </li>
                            <li>In your terminal navigate to the project directory and install dependencies by running:<p className="code-wrapper"><span className="code">npm install</span> </p> </li>
                            <li>Run the unit tests <p className="code-wrapper"><span className="code">npx hardhat test</span> <br/> </p></li>
                            <li>Start a local blockchain by running: <p className="code-wrapper"><span className="code">npx hardhat node</span> <br/> </p></li>
                            <li>Open your browser and open MetaMask extension, ensure you are on the Hardhat network. </li>
                            <li>Keep the hardhat node running and in a new terminal tab, deploy the smart contracts to the local blockchain by running: <p className="code-wrapper"><span className="code">npx hardhat run --network localhost scripts/1_deploy.js</span> </p></li>
                            <li>Run a script to populate the exchange with seed data:<br /> <p className="code-wrapper"><span className="code">npx hardhat run --network localhost scripts/2_seed-exchange.js</span> </p></li>
                            <li>Once the seed script has finished. Launch the development server and run the app<p className="code-wrapper"><span className="code">npm run start</span> </p> This should automatically open a new browser tab with dex app running locally, if it doesn't then go to http://localhost:3000/ in your browser</li>
                            <li>Now on the localhost page; Go to this Options tab, select Hardhat again, and continue with step 7. Connect your MetaMask wallet to the Exchange </li>
                            <li><i>Docker info adding soon</i></li>
                        </ul>
                        <br />
                        <hr />
                    </div>
                    }
                    <h2>{network === 'Hardhat' ? 7 : 5}. &nbsp;&nbsp; Connect your MetaMask wallet to the Exchange</h2>
                    <br />
                    <div className="inner-card">
                    {!account ? (
                        <div>
                            <button className='button' onClick={networkHandler}>Connect Account</button>
                        </div>
                    ) : (
                        <div>
                            <div className='flex-between'>
                                <p>Account connected</p>
                                <button className="button button--sm" onClick={networkHandler}>Reconnect</button>
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
                            <h2> Please continue to the next tab to use the exchange Faucet </h2>
                        </div>
                    )}
                    </div>
                </div>
            )}
        </div>
    );
  }

  export default Options;
