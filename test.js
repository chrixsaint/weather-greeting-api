// Importing packages
import dotenv from 'dotenv';
import "dotenv/config";
import express from 'express';
import axios from 'axios';
const app = express();

// Getting geolocation related data
const getGeodata = async (ip) => {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching geo data:", error);
    return {
      city: "unknown location",
      latitude: null,
      longitude: null
    };
  }
};

// Getting current temperature data
const getCurrentTemperature = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching temperature:", error);
    return { current_weather: { temperature: "unknown" } };
  }
};

app.get("/api/hello", async function (req, res) {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  if (ip.includes("::ffff:")) {
    ip = ip.split("::ffff:")[1];
  }

  const visitorName = req.query.visitor_name || "Guest";
  const geoData = await getGeodata(ip);
  const location = geoData.city || "unknown location";

  let temperature = "unknown";
  if (geoData.latitude && geoData.longitude) {
    const tempData = await getCurrentTemperature(
      geoData.latitude,
      geoData.longitude
    );
    temperature = tempData.current_weather?.temperature ?? "unknown";
  }

  const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celcius in ${location}.`;
  res.json({
    client_ip: ip,
    location: location,
    greeting: greeting
  });
});

//Handles wrong routes
app.all("*", (req, res) => {
  res.status(404).send(`Can't find ${req.originalUrl} on the server`);
});

// Server listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});