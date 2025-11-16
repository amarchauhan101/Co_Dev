const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get Real-Time Traffic Data
router.get("/get-traffic", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
    }
    
    try {
        const origin = `${lat},${lng}`;
        const destination = `${Number(lat) + 0.5},${Number(lng) + 0.5}`; // Increase distance
        
        const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
            params: {
                origin,
                destination,
                mode: "driving",
                departure_time: "now",
                key: process.env.ROUTE_API_KEY,
            },
        });
        
        if (response.data.status === "ZERO_RESULTS") {
            return res.status(404).json({ message: "No routes found for the specified coordinates." });
        }
        
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching data:", error.message);
        res.status(500).json({ error: "Failed to fetch traffic data" });
    }
});


module.exports = router;
