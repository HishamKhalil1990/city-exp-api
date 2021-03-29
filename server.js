'use strict'
const express = require('express');
const requestAgent = require('superagent');
const { request, response } = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const GEO_APIKEY = process.env.GEO_APIKEY;
const WEA_APIKEY = process.env.WEA_APIKEY;
const PARK_APIKEY = process.env.PARK_APIKEY;
let dataObj = {
    locationURL: '',
    weatherURL: ''
}
// //////////////////
// const url ='https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=' + PARK_APIKEY;
// console.log(url);
//     requestAgent.get(url).then(locationData => {
//         const mdata = locationData.total;
//         console.log(mdata);
//     })
// // /////////////////
const getLocation = (request, response) => {
    dataObj.locationURL = 'https://us1.locationiq.com/v1/search.php?key='+ GEO_APIKEY +'&q='+ request.query.city + '&format=json&limit=1';
    requestAgent.get(dataObj.locationURL).then(locationData => {
        const data = locationData.body[0];
        response.status(200).send(new Location(request.query.city, data.display_name, data.lat, data.lon));
    })
}
const getWeather = (request, response) => {

}
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.listen(PORT);

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
