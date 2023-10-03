import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json'
import EXCHANGE_ABI from '../abis/Exchange.json'

// ------------------------------------------------------------------------------------------------
// LOAD PROVIDER, NETWORK, ACCOUNT, TOKENS, EXCHANGE
// ------------------------------------------------------------------------------------------------
export const loadDefaultProvider = (dispatch) => {

	const connection = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`);
	dispatch({ type: 'PROVIDER_LOADED', connection })

	return connection
}

export const loadProvider = (dispatch) => {
	let connection

	if (window.ethereum) {
		connection = new ethers.providers.Web3Provider(window.ethereum);
	} else {
		const fallbackProvider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
		connection = fallbackProvider
	}
	dispatch({ type: 'PROVIDER_LOADED', connection })

	return connection
}

export const loadNetwork = async (provider, dispatch) => {
	let chainId = null
	try {
		const network  = await provider.getNetwork()
		chainId = network.chainId
	} catch (error) {
		console.log("Couldn't get network");
		chainId = null
	}

	dispatch({ type: 'NETWORK_LOADED', chainId })

	return chainId
}

export const loadAccount = async (provider, dispatch) => {

	const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
	const account = ethers.utils.getAddress(accounts[0])
	dispatch({ type: 'ACCOUNT_LOADED', account })
	let balance = await provider.getBalance(account)
	balance = ethers.utils.formatEther(balance)
	dispatch({ type: 'ETHER_BALANCE_LOADED', balance })

	return account
}

export const loadTokens = async (provider, addresses, dispatch) => {

	let token, symbol
	let tokens = []
	token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
	symbol = await token.symbol()
	dispatch({ type: 'TOKEN_1_LOADED', token, symbol })
	tokens.push(token);

	token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
	symbol = await token.symbol()
	dispatch({ type: 'TOKEN_2_LOADED', token, symbol })
	tokens.push(token);

	return tokens
}

export const loadExchange = async (provider, address, dispatch) => {

	const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
	dispatch({ type: 'EXCHANGE_LOADED', exchange })

	return exchange
}


// ------------------------------------------------------------------------------------------------
// SUBSCRIBE TO BLOCKCHAIN EVENTS
// ------------------------------------------------------------------------------------------------
 export const subscribeToEvents = async (exchange, tokens, dispatch) => {

	exchange.on('Deposit', (token, user, amount, balance, event) => {
		console.log("Deposit successful")
		dispatch({ type: 'TRANSFER_SUCCESS', event})
    })
	exchange.on('Withdraw', (token, user, amount, balance, event) => {
		console.log("Withdraw successful")
		dispatch({ type: 'TRANSFER_SUCCESS', event})
	})
	exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
    	const order = event.args
    	dispatch({ type: 'NEW_ORDER_SUCCESS', order, event})
	})
	exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
		const order = event.args
		dispatch({ type: 'ORDER_CANCEL_SUCCESS', order, event})
	})
	exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
		const order = event.args
		dispatch({ type: 'ORDER_FILL_SUCCESS', order, event})
	})

	let token0 = tokens[0]
	token0.removeAllListeners('Faucet');
	token0.on('Faucet', (deployer, recipient, amount, event) => {
		console.log("Token 1 faucet successful")
		dispatch({ type: 'FAUCET_SUCCESS', event})
		loadBalances(exchange, tokens, recipient, dispatch)
	})

	let token1 = tokens[1]
	token1.removeAllListeners('Faucet');
	token1.on('Faucet', (deployer, recipient, amount, event) => {
		console.log("Token 2 faucet successful")
		dispatch({ type: 'FAUCET_SUCCESS', event})
		loadBalances(exchange, tokens, recipient, dispatch)
	})
}

// ------------------------------------------------------------------------------------------------
// LOAD USER BALANCE (WALLLET & EXCHANGE BALANCES)
// ------------------------------------------------------------------------------------------------
export const loadBalances = async (exchange, tokens, account, dispatch) => {

	let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
	dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance })
	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
	dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance })

	balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
	dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance })
	balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
	dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance })
}

// ------------------------------------------------------------------------------------------------
// LOAD ALL ORDERS
// ------------------------------------------------------------------------------------------------

export const loadAllOrders = async (provider, exchange, dispatch) => {

	const block = await provider.getBlockNumber()

	const cancelStream = await exchange.queryFilter('Cancel', 0, block)
	const cancelledOrders = cancelStream.map(event => event.args)
	dispatch({ type: 'CANCELLED_ORDERS_LOADED', cancelledOrders })

	const tradeStream = await exchange.queryFilter('Trade', 0, block)
	const filledOrders = tradeStream.map(event => event.args)
	dispatch({ type: 'FILLED_ORDERS_LOADED', filledOrders })

	const orderStream = await exchange.queryFilter('Order', 0, block)
	const allOrders = orderStream.map(event => event.args)
	dispatch({ type: 'ALL_ORDERS_LOADED', allOrders })

}

// ------------------------------------------------------------------------------------------------
// TOKEN TRANSFERS: (deposits & withdraws)
// ------------------------------------------------------------------------------------------------
export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
	let transaction

	dispatch({ type: 'TRANSFER_PENDING'})

	try {

		const signer = await provider.getSigner();
		const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)

		if (transferType === 'Deposit'){

			const approveGasEstimate = await token.estimateGas.approve(exchange.address, amountToTransfer, { from: signer.getAddress() });
			const approveGasLimit = parseInt(approveGasEstimate * 1.5) // Adding a buffer
			console.log("Waiting for approval in MetaMask")
			transaction = await token.connect(signer).approve(exchange.address, amountToTransfer, { gasLimit: approveGasLimit })
			await transaction.wait()

			const depositGasEstimate = await exchange.estimateGas.depositToken(token.address, amountToTransfer, { from: signer.getAddress() });
			const depositGasLimit = parseInt(depositGasEstimate * 1.5)
			console.log("Waiting for confirmation in MetaMask")
			transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer, { gasLimit: depositGasLimit })

		} else {

			const withdrawGasEstimate = await exchange.estimateGas.withdrawToken(token.address, amountToTransfer, { from: signer.getAddress() });
			console.log("Waiting for confirmation in MetaMask")
			const withdrawGasLimit = parseInt(withdrawGasEstimate * 1.5)
			transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer, { gasLimit: withdrawGasLimit })

		  }

		await transaction.wait()

	} catch(error){
		dispatch({ type: 'TRANSFER_FAIL'})
	}
}

// ------------------------------------------------------------------------------------------------
// ORDER: (buy)
// ------------------------------------------------------------------------------------------------
export const makeBuyOrder = async (provider, exchange, tokens, order, dispatch) => {

	const tokenGet = tokens[0].address
	const amountGet = ethers.utils.parseUnits(order.amount, 18)
	const tokenGive = tokens[1].address
	const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)

	dispatch({ type: 'NEW_ORDER_REQUEST'})

	try {
		const signer = await provider.getSigner();
		console.log("Waiting on MetaMask Buy order confirmation")
		const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
		await transaction.wait();
	} catch (error) {
		dispatch({ type: 'NEW_ORDER_FAIL'})
	}
}
// ------------------------------------------------------------------------------------------------
// ORDER: (sell)
// ------------------------------------------------------------------------------------------------
export const makeSellOrder = async (provider, exchange, tokens, order, dispatch) => {

	const tokenGet = tokens[1].address
	const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
	const tokenGive = tokens[0].address
	const amountGive = ethers.utils.parseUnits(order.amount, 18)

	dispatch({ type: 'NEW_ORDER_REQUEST'})

	try {
		const signer = await provider.getSigner();
		console.log("Waiting on MetaMask Sell order confirmation")
		const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
		await transaction.wait();
	} catch (error) {
		dispatch({ type: 'NEW_ORDER_FAIL'})
	}
}

// ------------------------------------------------------------------------------------------------
// CANCEL ORDER
// ------------------------------------------------------------------------------------------------
export const cancelOrder = async (provider, exchange, order, dispatch) => {

	dispatch({ type: 'ORDER_CANCEL_REQUEST' })

	try {
		const signer = await provider.getSigner()
		const transaction = await exchange.connect(signer).cancelOrder(order.id)
		await transaction.wait()
	} catch (error) {
		dispatch({ type: 'ORDER_CANCEL_FAIL' })
	}
}

// ------------------------------------------------------------------------------------------------
// FILL ORDER
// ------------------------------------------------------------------------------------------------
export const fillOrder = async (provider, exchange, order, dispatch) => {

	dispatch({ type: 'ORDER_FILL_REQUEST' })

	try {
		const signer = await provider.getSigner()
		const transaction = await exchange.connect(signer).fillOrder(order.id)
		await transaction.wait()
	} catch (error) {
    	dispatch({ type: 'ORDER_FILL_FAIL' })
	}
  }

  // ------------------------------------------------------------------------------------------------
// FAUCET TOKENS
// ------------------------------------------------------------------------------------------------
export const faucetTokens = async (token, symbol, provider, exchange, tokens, account, dispatch) => {
	dispatch({ type: 'FAUCET_PENDING', symbol})

	try {
		console.log("Calling  faucetTokens() function for token: ", symbol + " (" + token.address + ")")

		const signer = await provider.getSigner();

		// const gasPrice = await provider.getGasPrice();
		const faucetGasEstimate = await token.estimateGas.faucet({ from: signer.getAddress() } );
		// const costInWei = faucetGasEstimate.mul(gasPrice).toString();
		// const costInEther = ethers.utils.formatEther(costInWei);
		console.log("Estimated transaction gas amount: ", faucetGasEstimate.toString())
		// console.log("Estimated transaction cost:" + costInEther + " (ETH), " + costInWei + " (wei)" );

		const faucetGasLimit = parseInt(faucetGasEstimate * 3)	// Just so it always passes, this is a demo
		console.log("Executing faucet() with gasLimit. Waiting for for confirmation in MetaMask")
		const transactionResponse = await token.connect(signer).faucet({ gasLimit: faucetGasLimit });
		const transactionReceipt = await transactionResponse.wait();

		if (transactionReceipt.status === 1) {
			console.log("faucet() was successful");
		} else {
			console.log("faucet() failed");
		}

	} catch(error){
		dispatch({ type: 'FAUCET_FAIL'})
		console.error("An error occurred while calling the faucet function: ", error);
	}
}
