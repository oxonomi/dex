import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import config from "../config.json";
import {
    loadDefaultProvider,
    loadNetwork,
    loadTokens,
    loadExchange,
    loadAllOrders,
    subscribeToEvents,
} from "../store/interactions";
import Info from "./Info";
import Options from "./Options";
import Faucet from "./Faucet";
import Balance from "./Balance";
import Order from "./Order";
import PriceChart from "./PriceChart";
import Transactions from "./Transactions";
import Alert from "./Alert";
import OrderHistory from "./OrderHistory";
import Contact from "./Contact";


function App() {

    const [network, setNetwork] = useState(0)
    const [activeTab, setActiveTab] = useState('Info');

    const provider = useSelector(state => state.provider.connection)
    const exchange = useSelector(state => state.exchange.contract)

    const dispatch = useDispatch();

    //ESLINT NOT HAPPY MOVED DEFAULT INSIDE USEFFECT - SEE GPT
    // MOVE TO INTERACTIONS?

    // const loadDefaultBlockchainData = async () => {
    //     const provider = loadDefaultProvider(dispatch);
    //     const chainId = await loadNetwork(provider, dispatch);
    //     if (!chainId) { return } // on network failure; Default PriceChart and OpenOrders loaded in respective components

    //     const OXO = config[chainId].OXO;
    //     const GBPc = config[chainId].GBPc;
    //     const tokens = await loadTokens(provider, [OXO.address, GBPc.address], dispatch);

    //     //Load Exchange Smart Contract
    //     const exchangeConfig = config[chainId].exchange;
    //     const exchange = await loadExchange(
    //         provider,
    //         exchangeConfig.address,
    //         dispatch
    //     );

    //     loadAllOrders(provider, exchange, dispatch);
    //     subscribeToEvents(exchange, tokens, dispatch);
    // }

    const changeTab = (e, tab) => {
        setActiveTab(tab);
        const allTabs = Array.from(e.target.parentNode.childNodes); //put all tabs in an array to .find
        const activeTab = allTabs.find(tab => tab.classList.contains('tab--active'));
        activeTab.className = 'tab';
        e.target.className = 'tab tab--active';
    };

    useEffect(() => {
        console.log("useEffect")
        const loadDefaultBlockchainData = async () => {
            const provider = loadDefaultProvider(dispatch);
            const chainId = await loadNetwork(provider, dispatch);
            if (!chainId) { return } // on network failure; Default PriceChart and OpenOrders loaded in respective components

            const OXO = config[chainId].OXO;
            const GBPc = config[chainId].GBPc;
            const tokens = await loadTokens(provider, [OXO.address, GBPc.address], dispatch);

            //Load Exchange Smart Contract
            const exchangeConfig = config[chainId].exchange;
            const exchange = await loadExchange(
                provider,
                exchangeConfig.address,
                dispatch
            );

            loadAllOrders(provider, exchange, dispatch);
            subscribeToEvents(exchange, tokens, dispatch);
        }

        loadDefaultBlockchainData();
    },[dispatch]);

    useEffect(() => {
        if (network !== 0) {
        loadAllOrders(provider, exchange, dispatch);
        }
    });


    return (
        <div>
            <div className='my__flex-parent'>
                <div className='my__header'>
                    <div className="tabs">
                        <button onClick={(e) => changeTab(e, 'Info')} className='tab tab--active'>About</button>
                        <button onClick={(e) => changeTab(e, 'Options')} className='tab'>Options</button>
                        <button onClick={(e) => changeTab(e, 'Faucet')} className='tab'>Faucet</button>
                        <button onClick={(e) => changeTab(e, 'DepWit')} className='tab'>Deposit & Withdrawals</button>
                        <button onClick={(e) => changeTab(e, 'MakeOrders')} className='tab'>Make Orders</button>
                        <button onClick={(e) => changeTab(e, 'PcOb')} className='tab'>Price Chart & Order Book</button>
                        <button onClick={(e) => changeTab(e, 'MyTrans')} className='tab'>My Transactions</button>
                        <button onClick={(e) => changeTab(e, 'Contact')} className='tab'>Contact</button>
                    </div>
                </div>
            </div>
            <main className="my__card">
                  {activeTab === 'Info' && <Info />}
                  {activeTab === 'Options' && <Options network={network} setNetwork={setNetwork} />}
                  {activeTab === 'Faucet' && <Faucet network={network} setNetwork={setNetwork} />}
                  {activeTab === 'DepWit' && <Balance />}
                  {activeTab === 'PcOb' && <PriceChart />}
                  {activeTab === 'PcOb' && <OrderHistory />}
                  {activeTab === 'MakeOrders' && <Order />}
                  {activeTab === 'MyTrans' && <Transactions />}
                  {activeTab === 'Contact' && <Contact />}
            </main>
            <Alert activeTab={activeTab} />
        </div>
    );
}

export default App;
