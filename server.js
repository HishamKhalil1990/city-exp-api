'use strict'
// const express = require('express');
// const cors = require('cors');
// const requestAgent = require('superagent');
// const { request, response } = require('express');
// const app = express();
// app.use(cors);
// const PORT = process.env.PORT || 3001;
// const GEO_APIKEY = process.env.GEO_APIKEY;
// const WEA_APIKEY = process.env.WEA_APIKEY;
// let dataObj = {
//     locationURL : '',
//     weatherURL : ''
// }
// const getLocation = (request,response)=>{
//     dataObj.locationURL = `https://us1.locationiq.com/v1/search.php?key=${GEO_APIKEY}&q=seattle&format=json&limit=1`;
//     requestAgent.get(dataObj.locationURL)
//         .then(locationData=>{
//             console.log(locationData.body[0]);
//             // response.status(200).send('good');
//         })
        
// }
// const getWeather = (request,response)=>{

// }
// app.get('/location',getLocation);
// app.get('/weather',getWeather);
// app.listen(PORT);

function Location(name, location, latitude, longitude) {
    this.search_query = name,
        this.formatted_query = location,
        this.latitude = latitude,
        this.longitude = longitude
}
function Weather(description, valid_date) {
    this.forecast = description,
        this.time = valid_date;
}
function Error() {
    this.status = 500,
    this.responseText = "Sorry, something went wrong"
}
const express = require("express")
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const cors = require('cors');
app.use(cors());
app.get('/location', (request, response, next) => {
    const arrData = require('./data/location.json');
    if (request.query.city == 'seattle') {
        const data = arrData[0];
        response.status(200).json(new Location(request.query.city, data.display_name, data.lat, data.lon));
        next();
    } else {
        response.status(500).json(new Error());
    }
})
app.get('/weather', (request, response) => {
    const objData = require('./data/weather.json');
    const weatherData = objData.data;
    const returnedData = [];
    console.log(request.query)
    weatherData.forEach(a => {
        returnedData.push(new Weather(a.weather.description, a.valid_date));
    });
    response.status(200).json(returnedData);
})
app.listen(PORT);