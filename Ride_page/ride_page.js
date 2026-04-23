import { supabase } from '../supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get the ride ID from the URL
    const params = new URLSearchParams(window.location.search);
    const rideId = params.get('id');

    if (!rideId) {
        document.getElementById('ride-details').innerHTML = '<p>No ride specified.</p>';
        return;
    }

    // Call the custom SQL function 'get_ride_details'
    const { data: ride, error } = await supabase
        .rpc('get_ride_details_v2', { ride_id_param: rideId })
        .single();

    if (error) {
        console.error('Error fetching ride details:', error);
        document.getElementById('ride-details').innerHTML = '<p>Could not fetch ride details. Check console for errors.</p>';
        return;
    }

    if (ride) {
        console.log('Ride data from database:', ride); // Log the returned object
        // Populate the page with the data from the function
        document.getElementById('ride-name').textContent = ride.ride_name || 'N/A';
        document.getElementById('ride-park').textContent = ride.park_name || 'N/A';
        document.getElementById('ride-manufacturer').textContent = ride.manufacturer_name || 'N/A';
        document.getElementById('ride-model').textContent = ride.model_name || 'v2';
        document.getElementById('ride-height').textContent = ride.height || 'NA';
        document.getElementById('ride-speed').textContent = ride.speed || 'NA';
        document.getElementById('ride-time').textContent = ride.ride_time || 'NA';
        document.getElementById('ride-inversions').textContent = ride.inversions || 'NA';
        document.getElementById('ride-lift-system').textContent = ride.lift_system_name || 'NA';
        
        if (ride.latitude && ride.longitude) {
            const map = L.map('map').setView([ride.latitude, ride.longitude], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            L.marker([ride.latitude, ride.longitude]).addTo(map)
                .bindPopup(ride.ride_name)
                .openPopup();
        }

    } else {
        document.getElementById('ride-details').innerHTML = '<p>Ride not found.</p>';
    }
});