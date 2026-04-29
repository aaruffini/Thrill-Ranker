import { supabase } from '../supabaseClient.js';

const map = L.map('map').setView([39.8283, -98.5795], 4); // Centered on the US

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// 1. Get user's location
navigator.geolocation.getCurrentPosition(success, error);

function success(pos) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    L.marker([lat, lng]).addTo(map)
        .bindPopup('Your Location')
        .openPopup();

    map.setView([lat, lng], 8);

    // 2. Fetch park data and run Huff Model
    fetchAndRunHuffModel(lat, lng);
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    // Fallback to a default location if user denies geolocation
    fetchAndRunHuffModel(40.7128, -74.0060); // New York City
}

async function fetchAndRunHuffModel(userLat, userLng) {
    // 3. Fetch park data from Supabase
    const { data: parks, error } = await supabase
        .from('parks')
        .select('name, location, overall_thrill_score');

    if (error) {
        console.error('Error fetching parks:', error);
        return;
    }

    // 4. Implement the Huff Model
    const huffResults = parks.map(park => {
        const parkLat = park.location.y; // Assuming location is a PostGIS point
        const parkLng = park.location.x;
        const distance = haversineDistance(userLat, userLng, parkLat, parkLng);
        
        // Simplified Huff Model: Attractiveness / (Distance^lambda)
        // Using overall_thrill_score as attractiveness
        // Assuming lambda = 2, a common value
        const lambda = 2;
        const probability = park.overall_thrill_score / Math.pow(distance, lambda);

        return { ...park, distance, probability };
    });

    // Normalize probabilities
    const totalProbability = huffResults.reduce((sum, park) => sum + park.probability, 0);
    huffResults.forEach(park => {
        park.probability = (park.probability / totalProbability) * 100;
    });

    // Sort by probability
    huffResults.sort((a, b) => b.probability - a.probability);

    // 5. Display results
    displayResults(huffResults);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function displayResults(results) {
    const parkList = document.getElementById('park-list');
    parkList.innerHTML = ''; // Clear previous results

    results.forEach(park => {
        const listItem = document.createElement('li');
        listItem.textContent = `${park.name}: ${park.probability.toFixed(2)}% chance`;
        parkList.appendChild(listItem);

        const parkLat = park.location.y;
        const parkLng = park.location.x;
        L.marker([parkLat, parkLng]).addTo(map)
            .bindPopup(`${park.name}<br>Probability: ${park.probability.toFixed(2)}%`);
    });
}
