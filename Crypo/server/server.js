const express = require('express')
const app = express()
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');
//const fetch = require('node-fetch');
const WebSocket = require('ws');
const server = http.createServer(app);
const io = socketIO(server);
const port =  8080 //process.env.PORT


//process.env.PASSWORD (secret)
//process.env.USERNAME (key)
const username = "CKI31TS9JZSX6FO7YJWT"
const password = "08cd3tL8DCaIqGgOTCaRdAoMb99kSoL80kio16Vz"

// Encoding to send with the request
const encoded_auth = Buffer.from(username + ':' + password).toString('base64');

app.use(express.static('public'))

// Creating an API endpoint for Hitorical Bars

/*
  Timeframes could be:
  [1-59]Min / T
  [1-23]Hour / H
  1Day / D
  1Week / W
  [1,2,3,4,6,12]Month / M
*/
app.get('/historicalbars/:symbol/:timeframe', (req,res)=>{

    const symbol = req.params.symbol;
    const timeframe = req.params.timeframe;

    var feed = "iex"
    var sort = "desc"
    var limit = "3000"
    
  // Get the current date
  var currentDate = new Date();

  // Subtract 10 years from the current date
  var startDate = new Date(currentDate);
  startDate.setFullYear(currentDate.getFullYear() - 10);

  // Format the dates to string in "YYYY-MM-DD" format
  var start = startDate.toISOString().slice(0, 10); //Start Date 10 years ago
  var end = currentDate.toISOString().slice(0, 10);

    var response_bars = {}

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://data.sandbox.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}` +
        `&start=${start}&limit=${limit}&adjustment=raw&feed=${feed}&sort=${sort}`,
        headers: { 
          'Authorization': `Basic ${encoded_auth}`
        }
      };
      
      axios.request(config)
      .then((response) => {
        response_bars = JSON.stringify(response.data)
        res.status(200).send(response_bars)
      })
      .catch((error) => {
        res.status(200).send(error)
      });
      
})

// Starting a web socket for real-time stock data
getData = () => {
  
  // Alpaca WebSocket connection
  const alpacaSocket = new WebSocket('wss://stream.data.sandbox.alpaca.markets/v2/iex');
  
  // Connection opened
  alpacaSocket.addEventListener('open', (event) => {
      console.log('Alpaca WebSocket connection opened:', event);
  
      // Authenticating using credentials
      const authMessage = {"action": "auth", "key": username, "secret": password};
      alpacaSocket.send(JSON.stringify(authMessage));
  
      // Subscribing to symbols like AAPL
      const subscribeMessage = {"action": "subscribe", "trades": ["AAPL"], "quotes": ["AMD", "CLDR"], "bars": ["*"], "dailyBars": ["VOO"], "statuses": ["*"]};
      alpacaSocket.send(JSON.stringify(subscribeMessage));
  });
  
  // Listen for messages from Alpaca WebSocket
  alpacaSocket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message from Alpaca:', message);
  
      // Emit the message to Socket.IO clients
      io.emit('dataFromAlpaca', message);
  });
  
  // Listen for WebSocket errors
  alpacaSocket.addEventListener('error', (event) => {
      console.error('Alpaca WebSocket error:', event);
  });
  
  // Listen for WebSocket closures
  alpacaSocket.addEventListener('close', (event) => {
      console.log('Alpaca WebSocket connection closed:', event);
  });
  
  // Socket.IO connection
  io.on('connection', (socket) => {
      console.log('Socket.IO client connected');
  
      // You can add more Socket.IO event listeners here if needed
  });
  
// Express route to serve frontend where the data is being received
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

  // Start the server
  const PORT = 3000;
  server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
  });
}
getData();
app.listen(port, () => console.log("The server is running!"))

