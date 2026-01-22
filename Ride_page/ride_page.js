import { supabase } from '/supabaseClient.js';

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
        .rpc('get_ride_details', { ride_id_param: rideId })
        .single();

    if (error) {
        console.error('Error fetching ride details:', error);
        document.getElementById('ride-details').innerHTML = '<p>Could not fetch ride details. Check console for errors.</p>';
        return;
    }

    if (ride) {
        // Populate the page with the data from the function
        document.getElementById('ride-name').textContent = ride.ride_name || 'N/A';
        document.getElementById('ride-park').textContent = ride.park_name ? `${ride.park_name} (${ride.city}, ${ride.state})` : 'N/A';
        document.getElementById('ride-manufacturer').textContent = ride.manufacturer_name || 'N/A';
        
        // The function returns NULL for these fields if the ride is not a rollercoaster
        document.getElementById('ride-model').textContent = ride.model || 'N/A';
        document.getElementById('ride-height').textContent = ride.height ? `${ride.height} ft` : 'N/A';
        document.getElementById('ride-speed').textContent = ride.top_speed ? `${ride.top_speed} mph` : 'N/A';
        document.getElementById('ride-material').textContent = ride.material || 'N/A';
        document.getElementById('ride-seating').textContent = ride.seat || 'N/A';
        document.getElementById('ride-lift-angle').textContent = ride.lift_angle ? `${ride.lift_angle}°` : 'N/A';
        document.getElementById('ride-drop-angle').textContent = ride.drop_angle ? `${ride.drop_angle}°` : 'N/A';
        document.getElementById('ride-time').textContent = ride.ride_time ? `${ride.ride_time} seconds` : 'N/A';
        document.getElementById('ride-inversions').textContent = ride.inversion_count !== null ? ride.inversion_count : 'N/A';
        document.getElementById('ride-lift-system').textContent = ride.lift_system || 'N/A';

    } else {
        document.getElementById('ride-details').innerHTML = '<p>Ride not found.</p>';
    }
});
