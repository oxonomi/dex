async function main() {
    // Fetch contracts to deploy
    const Token = await ethers.getContractFactory("Token")
    const Exchange = await ethers.getContractFactory("Exchange")

    // Fetch accounts
    const accounts = await ethers.getSigners()
    console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)


    // Deploy contracts
    //OXO token
    const oxo = await Token.deploy('Oxonomi', 'OXO', '1000000')
    await oxo.deployed()
    console.log(`Oxonomi Deployed to: ${oxo.address}`)
    // OXO is going to be the base token for the exchange, that all others are traded with

    const GBPc = await Token.deploy('GBPstablecoin', 'GBPc', '1000000')
    await GBPc.deployed()
    console.log(`Dummy GBP stablecoin Deployed to: ${GBPc.address}`)

    // const dDAI = await Token.deploy('Dummy Dai', 'dDAI', '1000000')
    // await dDAI.deployed()
    // console.log(`dummyDAI Deployed to: ${dDAI.address}`)

    // can add more coins here

    //deploy the Exchange
    const exchange = await Exchange.deploy(accounts[1].address, 1) //fee percentage
    await exchange.deployed()
    console.log(`Exchange Deployed to: ${exchange.address}`)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
