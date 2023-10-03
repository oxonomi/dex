const config = require('../src/config.json')

const tokens = (n) => {
    //converts ether value to wei
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
} // function to add a delay before returning the next promise
// to use settimeout in async and keep promise chain going, need to use settimeout on the promise

async function main() {

  // fetch accounts from wallet - these are unlocked
  const accounts = await ethers.getSigners()

  //fetch network
  const { chainId } = await ethers.provider.getNetwork()
  console.log("Using chainId: ", chainId)//if breaks, if hardhat update, change the config network number to whats shows here

  // fetch deployed tokens
  const OXO = await ethers.getContractAt('Token', config[chainId].OXO.address)
  console.log(`\nToken fetched: ${OXO.address}`)

  const GBPc = await ethers.getContractAt('Token', config[chainId].GBPc.address)
  console.log(`Token fetched: ${GBPc.address}`)

  // const dDAI = await ethers.getContractAt('Token', config[chainId].dDAI.address)
  // console.log(`Token fetched: ${dDAI.address}\n`)

  //fetch deployed exchange
  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
  console.log(`Exchange fetched: ${exchange.address}\n`)

  //give tokens to account[1]
  const sender = accounts[0]  //deployer / user1
  const receiver = accounts[1] // user2
  let amount = tokens(20000)


  //user1 transfer 10,000 in GBPc to user2
  let transaction, result
  transaction = await GBPc.connect(sender).transfer(receiver.address, amount)
  console.log(`Transferred ${amount} GBPc tokens from ${sender.address} to ${receiver.address}\n`)
  transaction = await OXO.connect(sender).transfer(receiver.address, amount)
  console.log(`Transferred ${amount} OXO tokens from ${sender.address} to ${receiver.address}\n`)



  //set up exchange user
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  //user1 approves 10,000 OXO
  transaction = await OXO.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} OXO from ${user1.address}`)
  //user1 deposits 10,000 OXO
  transaction = await exchange.connect(user1).depositToken(OXO.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} OXO from ${user1.address}\n`)

  //user1 approves 10,000 GBPc
  transaction = await GBPc.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} GBPc from ${user1.address}`)
  //user1 deposits 10,000 GBPc
  transaction = await exchange.connect(user1).depositToken(GBPc.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} GBPc from ${user1.address}\n`)



  //user2 deposits their GBPc to exchange
  //approve OXO
  transaction = await OXO.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} OXO from ${user2.address}`)
  // deposits OXO
  transaction = await exchange.connect(user2).depositToken(OXO.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} OXO from ${user2.address}\n`)

  //approve GBPc
  transaction = await GBPc.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} GBPc from ${user2.address}`)
  // deposits GBPc
  transaction = await exchange.connect(user2).depositToken(GBPc.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} GBPc from ${user2.address}\n`)

  /////////////////////////////////
  // Seed a cancelled order
  //

  //user1 makes order
  let orderId
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(100), OXO.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  //User1 cancel order
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  // wait for 1 second - for running on testnet or mainnet, to make sure web3js doesn't timeout
  await wait(1)


  // //////////////////////////////
  // // Seed  Filled orders
  // //

  // Day 1
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(24), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  console.log("order placed")
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log("order filled")
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(23), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  console.log("order placed2")
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("order filled2")
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(54), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  console.log("order placed3")
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log("order filled3")
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(26), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  console.log("order placed4")
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 1 done")
  await wait(1)

  //Day 2
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(78), OXO.address, tokens(3))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(100), OXO.address, tokens(4))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(29), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(27), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 2 done")
  await wait(1)

  //Day 3
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(54), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(104), OXO.address, tokens(4))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(70), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(320), OXO.address, tokens(10))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 3 done")
  await wait(1)

  //Day 4
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(128), OXO.address, tokens(4))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(175), OXO.address, tokens(7))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(62), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(28), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 4 done")
  await wait(1)

  //Day 5
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(280), OXO.address, tokens(10))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(336), OXO.address, tokens(14))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(210), OXO.address, tokens(7))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(78), OXO.address, tokens(3))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 5 done")
  await wait(1)

  //Day 6
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(208), OXO.address, tokens(8))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(69), OXO.address, tokens(3))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(29), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(28), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 6 done")
  await wait(1)

  //Day 7
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(280), OXO.address, tokens(10))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(52), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(218), OXO.address, tokens(6))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(36), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 7 done")
  await wait(1)

  //Day 8
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(36), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(324), OXO.address, tokens(9))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(88), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(714), OXO.address, tokens(17))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 8 done")

  await wait(1)

  //Day 9
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(84), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(39), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(54), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(47), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 9 done")
  await wait(1)

  //Day 10
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(376), OXO.address, tokens(8))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(88), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(561), OXO.address, tokens(11))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(150), OXO.address, tokens(3))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 10 done")
  await wait(1)

  //Day 11
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(100), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(46), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(216), OXO.address, tokens(4))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(96), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 11 done")
  await wait(1)

  //Day 12
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(48), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(470), OXO.address, tokens(10))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(165), OXO.address, tokens(3))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(54), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 12 done")
  await wait(1)

  //Day 13
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(216), OXO.address, tokens(4))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(108), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(558), OXO.address, tokens(9))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(120), OXO.address, tokens(2))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 13 done")
  await wait(1)

  //Day 14
  //Open
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(60), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Low
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(472), OXO.address, tokens(8))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //High
  transaction = await exchange.connect(user1).makeOrder(GBPc.address, tokens(207), OXO.address, tokens(3))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  await wait(1)
  //Close
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(69), OXO.address, tokens(1))
  result = await transaction.wait()
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).fillOrder(orderId)
  result = await transaction.wait()
  console.log("Day 14 done")
  await wait(1)



  ////////////////////////////////////////
  // Seed open orders
  //
  transaction = await exchange.connect(user1).makeOrder(OXO.address, tokens(1), GBPc.address, tokens(68))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user1).makeOrder(OXO.address, tokens(2), GBPc.address, tokens(134))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user1).makeOrder(OXO.address, tokens(2), GBPc.address, tokens(132))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user1).makeOrder(OXO.address, tokens(3), GBPc.address, tokens(195))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user1).makeOrder(OXO.address, tokens(5), GBPc.address, tokens(320))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user1).makeOrder(OXO.address, tokens(8), GBPc.address, tokens(504))
  result = await transaction.wait()
  await wait(1)
  console.log(`Open orders from ${user1.address}`)

  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(70), OXO.address, tokens(1))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(142), OXO.address, tokens(2))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(144), OXO.address, tokens(2))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(292), OXO.address, tokens(4))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(370), OXO.address, tokens(5))
  result = await transaction.wait()
  await wait(1)
  transaction = await exchange.connect(user2).makeOrder(GBPc.address, tokens(75), OXO.address, tokens(1))
  result = await transaction.wait()
  await wait(1)
  console.log(`Open orders from ${user2.address}`)

}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
