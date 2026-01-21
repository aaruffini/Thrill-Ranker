import { supabase } from '../supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get the ride ID from the URL
    const params = new URLSearchParams(window.location.search);
    const rideId = params.get('id');

    if (!rideId) {
        document.getElementById('ride-details').innerHTML = '<p>No ride specified.</p>';
        return;
    }

    // Fetch the ride data from Supabase
    const { data: ride, error } = await supabase
        .from('ride')
        .select(`
            name,
            ride_type,
            min_rider_height,
            park ( name, city, state ),
            manufacturer ( name ),
            rollercoaster ( * )
        `)
        .eq('id', rideId)
        .single();

    if (error) {
        console.error('Error fetching ride details:', error);
        document.getElementById('ride-details').innerHTML = '<p>Could not fetch ride details. Check console for errors.</p>';
        return;
    }

    if (ride) {
        // Populate the page with the ride data
        document.getElementById('ride-name').textContent = ride.name || 'N/A';
        
        // Display Park info from the joined 'park' table
        document.getElementById('ride-park').textContent = ride.park ? `${ride.park.name} (${ride.park.city}, ${ride.park.state})` : 'N/A';
        
        // Display Manufacturer info from the joined 'manufacturer' table
        document.getElementById('ride-manufacturer').textContent = ride.manufacturer ? ride.manufacturer.name : 'N/A';

        // Display Roller Coaster specific info if it exists
        if (ride.ride_type === 'Roller Coaster' && ride.rollercoaster) {
            const rc_details = ride.rollercoaster[0]; // It's an array, get the first element
            document.getElementById('ride-model').textContent = rc_details.model || 'N/A';
            document.getElementById('ride-height').textContent = rc_details.height ? `${rc_details.height} ft` : 'N/A';
            document.getElementById('ride-speed').textContent = rc_details.top_speed ? `${rc_details.top_speed} mph` : 'N/A';
        } else {
            document.getElementById('ride-model').textContent = 'N/A';
            document.getElementById('ride-height').textContent = 'N/A';
            document.getElementById('ride-speed').textContent = 'N/A';
        }

    } else {
        document.getElementById('ride-details').innerHTML = '<p>Ride not found.</p>';
    }
});
