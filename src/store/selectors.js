import { ethers } from "ethers";
import moment from "moment"
import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from 'lodash'

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')
const account = state => get(state, 'provider.account')
const events = state => get(state, 'exchange.events')

const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])


// ------------------------------------------------------------------------------------------------
// MY EVENTS
// ------------------------------------------------------------------------------------------------

export const myEventsSelector = createSelector(
    account,
    events,
    (account, events) => {
        events = events.filter((e) => e.args.user === account)
        return events
    }
)

// ------------------------------------------------------------------------------------------------
// OPEN ORDERS
// ------------------------------------------------------------------------------------------------
const openOrders = state => {
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)

    const openOrders = reject(all, (order) => { //using lodash reject function to remove filled and cancelled orders
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString()) // detect presence with .some
        const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
        return(orderFilled || orderCancelled)
  })

  return openOrders

}

// ------------------------------------------------------------------------------------------------
// MY OPEN ORDERS
// ------------------------------------------------------------------------------------------------
export const myOpenOrderSelector = createSelector(
    account,
    tokens,
    openOrders,
    (account, tokens, orders) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Filter out orders created by current account
        orders = orders.filter((o) => o.user === account)

        // Filter tokens for the current trading pair only
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // decorate orders - add display attributes
        orders = decorateMyOpenOrders(orders, tokens)
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)


        return orders
})

// DECORATE MY OPEN ORDER_S__________________________________
const decorateMyOpenOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens) // add display attributes
            order = decorateMyOpenOrder(order, tokens)
            return (order)
        })
    )
}

// DECORATE MY OPEN ORDER____________________________________
const decorateMyOpenOrder = (order, tokens) => {

    let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED)
    })
}


// ------------------------------------------------------------------------------------------------
// DECORATE ORDERS
//-----------------------------------------------------------------------------------------------
const decorateOrder = (order, tokens) => { //format the order: decimal amounts, calc Price, readable time
    let token0Amount, token1Amount

    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGet // The amount of OXO we are giving
        token1Amount = order.amountGive // The amount of GBPc we want
    } else {
        token0Amount = order.amountGive // The amount of OXO we want
        token1Amount = order.amountGet // The amount of GBPc we are giving
    }

    // round token price to 5 decimal, for front end only
    const precision = 100000
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice= Math.round(tokenPrice * precision) / precision

    return ({
        ...order,
        token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
        tokenPrice: tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa ddd MMM D') //using moment library to convert to human readable
    })

}

// ------------------------------------------------------------------------------------------------
// ALL FILLED ORDERS
// ------------------------------------------------------------------------------------------------
export const filledOrdersSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Filter tokens for the current trading pair only
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        //sort orders by time ascending, for coloring
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)
        orders = decorateFilledOrders(orders, tokens)
        // then sort to descending for the UI
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)


        return orders
    }
)

// DECORATE FILLED ORDER_S__________________________________
const decorateFilledOrders = (orders, tokens) => {
    let previousOrder = orders[0]// save latest filled order

    return (
    orders.map((order) => {
        //decorate each individual order
        order = decorateOrder(order, tokens)
        order = decorateFilledOrder(order, previousOrder)
        previousOrder = order
        return order
    }))
}
// DECORATE FILLED ORDER ___________________________________
const decorateFilledOrder = (order, previousOrder) => {
    return({
        ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)})
}

// TOKEN PRICE CLASS ______________________________________
const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if(previousOrder.tokenPrice <= tokenPrice || previousOrder.id === orderId ){
        return GREEN;
    } else {
        return RED;
    }
}



// ------------------------------------------------------------------------------------------------
// MY FILLED ORDERS
//  -----------------------------------------------------------------------------------------------

export const myFilledOrderSelector = createSelector(
    account,
    tokens,
    filledOrders,
    (account, tokens, orders) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Find our orders
        orders = orders.filter((o) => o.user === account || o.creator === account)
        // Filter orders for current trading pair
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)

        // Decorate orders - add display attributes
        orders = decorateMyFilledOrders(orders, account, tokens)

        return orders
})

// DECORATE MY FILLED ORDER_S__________________________________
const decorateMyFilledOrders = (orders, account, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyFilledOrder(order, account, tokens)
            return (order)
        })
    )
}

// DECORATE MY FILLED ORDER____________________________________
const decorateMyFilledOrder = (order, account, tokens) => {
    const myOrder = order.creator === account

    let orderType
    if(myOrder) {
        orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    } else {
        orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
    }

    return({
        ...order,
        orderType,
        orderClass: (orderType === 'buy' ? GREEN : RED),
        orderSign: (orderType === 'buy' ? '+' : '-')
    })
}


// ------------------------------------------------------------------------------------------------
// ORDER BOOK
// ------------------------------------------------------------------------------------------------
export const orderBookSelector = createSelector(
    openOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Filter tokens for our current trading pair only
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        //Decorate orders
        orders = decorateOrderBookOrders(orders, tokens)

        // group orders by orderType (buy and sell)
        orders = groupBy(orders, 'orderType')
        const buyOrders = get(orders, 'buy', []) //[] empty array incase no orders
        //sort buy orders by token price
        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }

        //fetch sell orders
        const sellOrders = get(orders, 'sell', [])
        //sort sell orders by token price
        orders = {
            ...orders,
            sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }

        return orders
})

const decorateOrderBookOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return(order)
        })
    )
}

const decorateOrderBookOrder = (order, tokens) => {

    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}


// ------------------------------------------------------------------------------------------------
// PRICE CHART
// ------------------------------------------------------------------------------------------------

export const priceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // Sort orders by date ascending to compare history
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)

        // Decorate orders - add display attributes: token1Amount, token2Amount, tokenPrice formattedTimestamp
        orders = orders.map((o) => decorateOrder(o, tokens)) // decimal amounts, readable time

        //get last 2 orders
        let secondLastOrder, lastOrder
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

        const lastPrice = get(lastOrder, 'tokenPrice', 0) // use lodash get incase blank, get lastOrders.tokenPrice
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)


        return({
            lastPrice: lastPrice,
            lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
            series:[{
                data: buildGraphData(orders)
            }],
        })

    })


// GRAPH _____________________________

const buildGraphData = (orders) => {

    /*
    In order to make the graph UI look more like a live exchange I've taken all early trades and altered their last day to show as yesterday
    Therefore there's no empty gaps in the graph with no trading data
    */

    // get first 56 orders (orders from seed_exchange script)
    let seedOrders = orders.slice(0, 56);
    let otherOrders = orders.slice(56);

    const todaysOrders = [];
    const today = moment().startOf('day');

    otherOrders.forEach(order => {
        const orderDate = moment.unix(order.timestamp);
        if (orderDate.isSameOrAfter(today)) {
            todaysOrders.push(order);
        }
    });

    // Group orders into 4's, High, low, open, close.
    function groupByCount(seedOrders, groupSize) {
        var groups = [];
        for (var i = 0; i < seedOrders.length; i += groupSize) {
            groups.push(seedOrders.slice(i, i + groupSize));
        }
        return groups;
    }
    seedOrders = groupByCount(seedOrders, 4);


    // calculate starting day
    const startingDay = moment().subtract(seedOrders.length, 'days')
    // console.log("startingDay: ", startingDay)

    const seedGraphData = seedOrders.map((group, index) => {

        //calculate price values: open, high, low, close
        const open = group[0]
        const high = maxBy(group, 'tokenPrice')//using lodash. tokenPrice added from decorateOrder() in priceChartSelector()
        const low = minBy(group, 'tokenPrice')//using lodash
        const close = group[group.length - 1]

        return({
            x: moment(startingDay).add(index, 'days').toDate(),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        })
    })

    let openToday, highToday, lowToday, closeToday
    let todaysGraphData =[]

    if (!todaysOrders.length) {
        // console.log("No trades today")
    } else {
        openToday = todaysOrders[0];
        highToday = maxBy(todaysOrders, 'tokenPrice');
        lowToday = minBy(todaysOrders, 'tokenPrice');
        closeToday = todaysOrders[todaysOrders.length - 1];

        todaysGraphData = {
            x: moment().toDate(),
            y: [openToday.tokenPrice, highToday.tokenPrice, lowToday.tokenPrice, closeToday.tokenPrice]
        };
    }

    const graphData = seedGraphData.concat(todaysGraphData)
    return graphData
}
