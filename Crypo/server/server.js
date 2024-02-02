const express = require('express')
const app = express()
const axios = require('axios');
const WebSocket = require('ws');

const port =  8080 //process.env.PORT
const username = "CKI31TS9JZSX6FO7YJWT"
const password = "08cd3tL8DCaIqGgOTCaRdAoMb99kSoL80kio16Vz"
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
const socket = new WebSocket('wss://stream.data.sandbox.alpaca.markets/v2/iex');

// Connection opened
socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);

      // authenticateing using our credentials
      const messageToSend = {"action": "auth", "key": username , "secret": password}
      // Convert the message object to a JSON string and send it
      socket.send(JSON.stringify(messageToSend));
});

// Listen for messages from the server
socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    console.log('Received message:', message);

    // Handle the incoming messages as needed
    // For example, you can access specific fields in the message object.
});

// Listen for WebSocket errors
socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
});

// Listen for WebSocket closures
socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed:', event);
});
}
// Close the WebSocket connection when done (optional)
// socket.close();
getData();

app.listen(port, () => console.log("The server is running!"))

