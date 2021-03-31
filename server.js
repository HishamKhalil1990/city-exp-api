'use strict'
// environment setups
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
// libraries declerations
const express = require('express');
const requestAgent = require('superagent');
const cors = require('cors');
const pg = require('pg');
// creating the application
const app = express();
// app middleware setups
app.use(cors());
// creating and setting up psql client for database
const client = new pg.Client({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});
client.on('error',error =>{throw error;})
client.connect().then( () => {
})
app.listen(PORT);
console.log('listening to port');
// creating request middlewares handler functions
const getLocation = (request, response) => {
    const selectSql = 'SELECT * FROM locationTable WHERE name = $1';
    // get the city saved data
    client.query(selectSql,[request.query.city]).then(citySavedData =>{
        if(citySavedData.rowCount == 0){
            try{
                const url = 'https://us1.locationiq.com/v1/search.php?key=' + GEOCODE_API_KEY + '&q=' + request.query.city + '&format=json&limit=1';
                requestAgent.get(url).then(locationData => {
                    const data = locationData.body[0];
                    // add to database commands
                    const addSql = 'INSERT INTO locationTable (name, location, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *';
                    const locationInfo = [request.query.city, data.display_name, data.lat, data.lon];
                    client.query(addSql,locationInfo).then(data => {
                        console.log('saved')
                    })
                })
                response.status(200).json(new Location(request.query.city, data.display_name, data.lat, data.lon));
            }catch(error){
                response.status(404).send('it is not found');
            }
        }else{
            response.status(200).json(citySavedData);
        }
    })
}
const getWeather = async (request, response) => {
    try{
        const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${WEATHER_API_KEY}`
        const weatherData = await requestAgent.get(url)
        const parseWeartherData = JSON.parse(weatherData.text).data;
        const neededData = parseWeartherData.map(a=>{
            return new Weather(a.weather.description,a.datetime)
        })
        response.status(200).send(neededData);
    }catch(error){
        response.status(404).send('it is not found');
    }
}
const getPark = (request, response) => {
    try{
        const url = 'https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=' + PARKS_API_KEY;
        requestAgent.get(url).then(parksData => {
            const data = parksData.body.data[0];
            const name = data.fullName;
            const address = data.addresses[0].line1 + data.addresses[0].city;
            const fee = data.entranceFees[0].cost;
            const description = data.description;
            const parkUtl = data.url;
            const dataArr = [new Park(name, address, fee, description, parkUtl)];
            response.status(200).json(dataArr);
        })
    }catch(error){
        response.status(404).send('it is not found');
    }

}
// creating request middlewares
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/parks', getPark);
// creating function constructors
function Location(name, location, latitude, longitude) {
    this.search_query = name;
    this.formatted_query = location;
    this.latitude = latitude;
    this.longitude = longitude;
}
function Weather(description, valid_date) {
    this.forecast = description;
    this.time = valid_date;
}
function Park(name, address, fee, description, url) {
    this.name = name;
    this.address = address;
    this.fee = fee;
    this.description = description,
    this.url = url;
}
function Error() {
    this.status = 500;
    this.responseText = "Sorry, something went wrong";
}
