import { supabase } from '../supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get the ride ID from the URL
    const params = new URLSearchParams(window.location.search);
    const parkID = params.get('id');

    if (!parkID) {
        document.getElementById('park-details').innerHTML = '<p>No park specified.</p>';
        return;
    }

    // Call the custom SQL function 'get_park_details'
    // focusing on less vibe coded focus on this part
    
    const { data: park, error } = await supabase
        .rpc('get_park_details', { park_id_param: parkID })
        .single();

    if (error) {
        console.error('Error fetching ride details:', error);
        document.getElementById('ride-details').innerHTML = '<p>Could not fetch ride details. Check console for errors.</p>';
        return;
    }

    if (park) {
        // Populate the page with the data from the function
        document.getElementById('park-name').textContent = parks.name || 'N/A';
        document.getElementById('park-city').textContent = parks.city || 'N/A';
        document.getElementById('park-state').textContent = parks.state || 'N/A';
        
        
       

    } else {
        document.getElementById('ride-details').innerHTML = '<p>Ride not found.</p>';
    }
});