'use strict'
const express = require('express');
const requestAgent = require('superagent');
const app = express();
const cors = require('cors');
app.use(cors());
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const GEO_APIKEY = process.env.GEO_APIKEY;
const WEA_APIKEY = process.env.WEA_APIKEY;
const PARK_APIKEY = process.env.PARK_APIKEY;
// //////////////////

// // /////////////////
const getLocation = (request, response) => {
    const url = 'https://us1.locationiq.com/v1/search.php?key=' + GEO_APIKEY + '&q=' + request.query.city + '&format=json&limit=1';
    requestAgent.get(url).then(locationData => {
        const data = locationData.body[0];
        response.status(200).json(new Location(request.query.city, data.display_name, data.lat, data.lon));
    })
}
const getWeather = (request, response) => {

}
const getPark = (request, response) => {
    const url = 'https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=' + PARK_APIKEY;
    requestAgent.get(url).then(parksData => {
        // const bigData = require('./a.json');
        // const data = bigData.data[0];
        const data = parksData.data[0];
        const name = data.fullName;
        const address = data.addresses[0].line1 + data.addresses[0].city;
        const fee = data.entranceFees[0].cost;
        const description = data.description;
        const parkUtl = data.url;
        response.status(200).json(new Park(name, address, fee, description, parkUtl));
    })

}
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/parks', getPark);
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
function Park(name, address, fee, description, url) {
    this.name = name,
        this.address = address,
        this.fee = fee,
        this.description = description,
        this.url = url
}
function Error() {
    this.status = 500,
        this.responseText = "Sorry, something went wrong"
}
