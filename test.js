import "dotenv/config";
import fetch from 'node-fetch';
import express from 'express';
import requestIp from 'request-ip';

const app = express();
app.use(requestIp.mw());

async function getLocation(ip) {
    const url = `https://ipapi.co/${ip}/json/`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.city; // Only the city is needed for this task
    } catch (error) {
        console.error('Failed to fetch location:', error);
        return null;
    }
}

async function getTemperature(city) {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.main && data.main.temp) {
            return data.main.temp; // Returns the temperature in Celsius
        } else {
            throw new Error('Temperature data not found');
        }
    } catch (error) {
        console.error(`Failed to fetch temperature for city ${city}: ${error}`);
        return null; // Return null or appropriate value in case of failure
    }
}
app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Guest';
    const clientIp = req.clientIp; // Retrieve the requester's IP address
    console.log(`Client IP: ${clientIp}`); // Log the IP address

    // Temporarily use a known public IP for testing
    // const clientIp = '8.8.8.8'; // Uncomment for testing with a public IP

    const city = await getLocation(clientIp);
    console.log(`City: ${city}`); // Log the fetched city

    const temperature = await getTemperature(city);
    console.log(`Temperature: ${temperature}`); // Log the temperature

    if (city && temperature !== null) {
        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } else {
        res.status(500).send('Could not determine location or temperature');
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));