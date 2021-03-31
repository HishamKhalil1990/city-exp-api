'use strict'
// environment setups
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV;
// libraries declerations
const express = require('express');
const requestAgent = require('superagent');
const cors = require('cors');
const pg = require('pg');
const { request, response } = require('express');
// creating the application
const app = express();
// app middleware setups
app.use(cors());
// creating and setting up psql client for database
const options = NODE_ENV === 'production' ? { connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } } : { connectionString: DATABASE_URL};
const client = new pg.Client(options);
client.on('error',error =>{throw error;})
client.connect().then( () => {
    app.listen(PORT);
    console.log('listening to port');
}).catch(error=>{
    console.log("client connction faild");
})
// creating request middlewares handler functions
const getLocation = (request, response) => {
    const city = request.query.city;
    // get the city saved data
    const selectSql = 'SELECT * FROM locationTable WHERE name = $1';
    client.query(selectSql,[city]).then(citySavedData =>{
        if(citySavedData.rowCount == 0){
            try{
                // city is not listed in the table
                const url = 'https://us1.locationiq.com/v1/search.php?key=' + GEOCODE_API_KEY + '&q=' + city + '&format=json&limit=1';
                requestAgent.get(url).then(locationData => {
                    const data = locationData.body[0];
                    // add to database commands
                    const addSql = 'INSERT INTO locationTable (name, location, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *';
                    const locationInfo = [city, data.display_name, data.lat, data.lon];
                    client.query(addSql,locationInfo).then(data => {
                        console.log('saved')
                    })
                    response.status(200).json(new Location(city, data.display_name, data.lat, data.lon));
                })
            }catch(error){
                response.status(404).send('it is not found');
            }
        }else{
            response.status(200).json(new Location(citySavedData.rows[0].name, citySavedData.rows[0].location, citySavedData.rows[0].latitude, citySavedData.rows[0].longitude));
        }
    })
}
const getWeather = async (request, response) => {
    let values = Object.keys(request.query);
    let url;
    if (values[0] == "search_query"){
        url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${WEATHER_API_KEY}`
    }else{
        url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.name}&key=${WEATHER_API_KEY}`
    }
    try{
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
const getMovies = (request,response) => {

}
const getYelp = (request,response) => {

}
// creating request middlewares
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/parks', getPark);
app.get('/movies',getMovies);
app.get('yelp',getYelp);
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
