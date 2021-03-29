'use strict'
const express = require('express');
const cors = require('cors');
const requestAgent = require('superagent');
const { request, response } = require('express');
const app = express();
app.use(cors);
const PORT = process.env.PORT || 3001;
app.listen(PORT);
const GEO_APIKEY = process.env.GEO_APIKEY;
const WEA_APIKEY = process.env.WEA_APIKEY;
let dataObj = {
    locationURL : '',
    weatherURL : ''
}
const getLocation = (request,response)=>{
    dataObj.locationURL = `https://us1.locationiq.com/v1/search.php?key=${GEO_APIKEY}&q=${request.query.city}&format=json&limit=1`;
    requestAgent.get(dataObj.locationURL)
        .then(locationData=>{
            console.log(locationData.body[0]);
            response.send('good');
        })
    
}
const getWeather = (request,response)=>{

}
app.get('/location',getLocation);
app.get('/weather',getWeather);

