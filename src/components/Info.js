const Info = () => {

    return (
        <div>
            <h1>About</h1>
            <br />
            <br />
            <ul className="bullets">
                <li>
                    This app is a decentralised cryptocurrency token exchange similar to &nbsp;
                    <a href="https://app.uniswap.org/" target="_blank" rel="noreferrer">UniSwap</a>
                    &nbsp;and&nbsp;
                    <a href="https://pancakeswap.finance/" target="_blank" rel="noreferrer">PancakeSwap</a>.
                    It is built with React and Solidity, and hosted on&nbsp;
                    <a href="https://ipfs.tech/" target="_blank" rel="noreferrer">IPFS</a>.
                </li>
                <li>Please view on the desktop, the mobile experience is still being worked on.</li>
                <li><strong><span style={{color:'var(--clr-accent)'}}>You can explore the tabs to get an understanding of the app without needing to connect your wallet,</span></strong> but for the full experience you must follow the instructions on the Options page and connect your wallet to the testnet.</li>
                <li>It is a fully functional desktop demo running on testnets, intended to showcase smart contract functionality. It is not a production version. The smart contract allows for many tokens to be created and deployed, in this demo you can exchange the tokens OXO and GBPc </li>
                <li><span style={{color:'#ff5151'}}>WARNING: All coins and tokens on this site are fictitious and for demonstration purposes only, and do not hold any real world value.  Do not send any real tokens or crypto currency to any addresses on this site. Please only proceed to test these smart contracts if you are familiar with Sepolia, Mumbai, Hardhat, or similar testnets.</span> </li>
            </ul>
            <hr />
            <br />
            <h2>Overview of functionality</h2>
            <br />
            <br />
            <ul className="bullets">
                <li>Pick a testnet; Hardhart(ETH), Sepolia(ETH), Mumbai(MATIC)</li>
                <li>Connect your MetaMask wallet</li>
                <li>Use the token smart contract faucet function to receive OXO and GBPc tokens. </li>
                <li>Use the Deposit function to move tokens from your MetaMask wallet to the exchange smart contract. </li>
                <li>View Price Chart and Order Book of existing trades.</li>
                <li>Fill the order of another user, Taking the trade.</li>
                <li>Create your own order for others to fill, Making the trade.</li>
                <li>View your transaction history and open orders</li>
                <li>Withdraw your tokens from the exchange smart contract back to your MetaMask wallet</li>
            </ul>

        </div>
    );
  }

  export default Info;
