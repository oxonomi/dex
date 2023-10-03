import moment from "moment"

export const options = {
    chart: {
      animations: { enabled: true },
      toolbar: { show: false }, //make cleaner
      width: '100px'
    },
    tooltip: { // info on hover
      enabled: true,
      theme: false,
      style: {
        fontSize: '12px',
        fontFamily: undefined
      },
      x: {
        show: false,
        format: 'dd MMM',
        formatter: undefined,
      },
      y: {
        show: true,
        title: 'price'
      },
      marker: {
        show: false,
      },
      items: {
        display: 'flex',
      },
      fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
      },
    },
    grid: {
      show: true,
      borderColor: '#767F92',
      strokeDashArray: 0
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#25CE8F', //green
          downward: '#F45353' //red
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        style: {
          colors: '#767F92',
          fontSize: '14px',
          cssClass: 'apexcharts-xaxis-label',
        },
      }
    },
    yaxis: {
      labels: {
        show: true, //show y axis resolution
        minWidth: 0,
        maxWidth: 160,
        style: {
          color: '#F1F2F9',
          fontSize: '14px',
          cssClass: 'apexcharts-yaxis-label',
        },
        offsetX: 0,
        offsetY: 0,
        rotate: 0,
      }
    }
  }

  // Code in the series as a temporary placeholder for demonstration


  const defaultSeries = [
    {
    data: [
      ['date', [24, 27, 23, 26]],
      ['date', [26, 29, 25, 27]],
      ['date', [27, 35, 26, 32]],
      ['date', [32, 32, 25, 28]],
      ['date', [28, 30, 24, 26]],
      ['date', [26, 29, 23, 28]],
      ['date', [28, 36.33, 26, 36]],
      ['date', [36, 44, 36, 42]],
      ['date', [42, 54, 39, 47]],
      ['date', [47, 51, 44, 50]],
      ['date', [50, 54, 46, 48]],
      ['date', [48, 55, 47, 54]],
      ['date', [54, 62, 54, 60]],
      ['date', [60, 69, 59, 69]],
    ]
  }
]

const today = moment().startOf('day');

const updatedSeries = defaultSeries.map(series => {
  const newData = series.data.map((entry, index) => {
    const daysAgo = series.data.length - index - 1;
    const date = moment(today).subtract(daysAgo, 'days').format('YYYY-MM-DD');
    return [date, entry[1]];
  });

  return {
    ...series,
    data: newData,
  };
});

export const datedDefaultSeries = updatedSeries;


  export const series = [ //data = array of candles sticks [time (x), [open, high, low, close](y)],
    {
      data: [
        [24.01, [24, 27, 23, 26]],
        [25.01, [26, 29, 25, 27]],
        [26.01, [27, 35, 26, 32]],
        [27.01, [32, 32, 25, 28]],
        [28.01, [28, 30, 24, 26]],
        [29.01, [26, 29, 23, 28]],
        [30.01, [28, 36.33, 26, 36]],
        [31.01, [36, 44, 36, 42]],
        [32.01, [42, 54, 39, 47]],
        [33.01, [47, 51, 44, 50]],
        [34.01, [50, 54, 46, 48]],
        [35.01, [48, 55, 47, 54]],
        [36.01, [54, 62, 54, 60]],
        [36.01, [60, 69, 59, 68]],
      ]
    }
  ]




// used as a default for open orders, when user is previewing and not testing
 export const defaultOrderbookOrders = {
    "buyOrders": [
        {
            "token1Amount": "68.0",
            "token0Amount": "1.0",
            "tokenPrice": 68,
            "formattedTimestamp": "3:21:01pm 4 Sep 14",
            "orderType": "buy",
            "orderTypeClass": "#25CE8F",
            "orderFillAction": "sell"
        },
        {
            "token1Amount": "134.0",
            "token0Amount": "2.0",
            "tokenPrice": 67,
            "formattedTimestamp": "3:21:02pm 4 Sep 14",
            "orderType": "buy",
            "orderTypeClass": "#25CE8F",
            "orderFillAction": "sell"
        },
        {
            "token1Amount": "132.0",
            "token0Amount": "2.0",
            "tokenPrice": 66,
            "formattedTimestamp": "3:21:03pm 4 Sep 14",
            "orderType": "buy",
            "orderTypeClass": "#25CE8F",
            "orderFillAction": "sell"
        },
        {
            "token1Amount": "195.0",
            "token0Amount": "3.0",
            "tokenPrice": 65,
            "formattedTimestamp": "3:21:04pm 4 Sep 14",
            "orderType": "buy",
            "orderTypeClass": "#25CE8F",
            "orderFillAction": "sell"
        },
        {
            "token1Amount": "320.0",
            "token0Amount": "5.0",
            "tokenPrice": 64,
            "formattedTimestamp": "3:21:05pm 4 Sep 14",
            "orderType": "buy",
            "orderTypeClass": "#25CE8F",
            "orderFillAction": "sell"
        },
        {
            "token1Amount": "504.0",
            "token0Amount": "8.0",
            "tokenPrice": 63,
            "formattedTimestamp": "3:21:06pm 4 Sep 14",
            "orderType": "buy",
            "orderTypeClass": "#25CE8F",
            "orderFillAction": "sell"
        }
      ],
    "sellOrders": [
        {
            "token1Amount": "75.0",
            "token0Amount": "1.0",
            "tokenPrice": 75,
            "formattedTimestamp": "3:21:12pm 4 Sep 14",
            "orderType": "sell",
            "orderTypeClass": "#F45353",
            "orderFillAction": "buy"
        },
        {
            "token1Amount": "370.0",
            "token0Amount": "5.0",
            "tokenPrice": 74,
            "formattedTimestamp": "3:21:11pm 4 Sep 14",
            "orderType": "sell",
            "orderTypeClass": "#F45353",
            "orderFillAction": "buy"
        },
        {
            "token1Amount": "292.0",
            "token0Amount": "4.0",
            "tokenPrice": 73,
            "formattedTimestamp": "3:21:10pm 4 Sep 14",
            "orderType": "sell",
            "orderTypeClass": "#F45353",
            "orderFillAction": "buy"
        },
        {
            "token1Amount": "144.0",
            "token0Amount": "2.0",
            "tokenPrice": 72,
            "formattedTimestamp": "3:21:09pm 4 Sep 14",
            "orderType": "sell",
            "orderTypeClass": "#F45353",
            "orderFillAction": "buy"
        },
        {
            "token1Amount": "142.0",
            "token0Amount": "2.0",
            "tokenPrice": 71,
            "formattedTimestamp": "3:21:08pm 4 Sep 14",
            "orderType": "sell",
            "orderTypeClass": "#F45353",
            "orderFillAction": "buy"
        },
        {
            "token1Amount": "70.0",
            "token0Amount": "1.0",
            "tokenPrice": 70,
            "formattedTimestamp": "3:21:07pm 4 Sep 14",
            "orderType": "sell",
            "orderTypeClass": "#F45353",
            "orderFillAction": "buy"
        }
      ]
  }
