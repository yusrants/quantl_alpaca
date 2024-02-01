const express = require('express')
const app = express()
const axios = require('axios');

const port =  8080 //process.env.PORT
const username = "CKI31TS9JZSX6FO7YJWT"
const password = "08cd3tL8DCaIqGgOTCaRdAoMb99kSoL80kio16Vz"
const encoded_auth = Buffer.from(username + ':' + password).toString('base64');

app.use(express.static('public'))


// Creating an API endpoint for Hitorical Bars
app.get('/hitoricalbars/:symbol/:timeframe', (req,res)=>{

    const symbol = req.params.symbol;
    const timeframe = req.params.timeframe;
    
  // Get the current date
  var currentDate = new Date();

  // Subtract 10 years from the current date
  var startDate = new Date(currentDate);
  startDate.setFullYear(currentDate.getFullYear() - 10);

  // Format the dates to string in "YYYY-MM-DD" format
  var start = startDate.toISOString().slice(0, 10);
  var end = currentDate.toISOString().slice(0, 10);

  console.log("Start Date 10 years ago:", start);
  console.log("End Date today:", end);
    console.log("Date is " + start);

    var response_bars = {}

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://data.sandbox.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=${timeframe}` +
        `&start=${start}&limit=1000&adjustment=raw&feed=sip&sort=asc`,
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
        console.log(error);
      });
      
})
app.listen(port, () => console.log("The server is running!"))
