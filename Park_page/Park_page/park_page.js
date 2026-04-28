import { supabase } from '../../supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get the ride ID from the URL
    const params = new URLSearchParams(window.location.search);
    const parkID = params.get('id');

    if (!parkID) {
        document.getElementById('park-details').innerHTML = '<p>No park specified.</p>';
        return;
    }

    // Call the custom SQL function 'get_park_details_with_rides'
    const { data: park, error } = await supabase
        .rpc('get_park_details', { park_id_param: parkID })
        .single();

    if (error) {
        console.error('Error fetching park details:', error);
        document.getElementById('park-details').innerHTML = '<p>Could not fetch park details. Check console for errors.</p>';
        return;
    }

    if (park) {
        document.getElementById('park-name').textContent = park.name || 'N/A';
        document.getElementById('park-city').textContent = park.city || 'N/A';
        document.getElementById('park-state').textContent = park.state || 'N/A';
        document.getElem
        // Assuming you have an element with id 'park-rides' to display the rides
        const ridesList = document.getElementById('park-rides');
        if (ridesList) {
            if (park.rides) {
                // Split the comma-separated string into an array of ride names
                const rides = park.rides.split(', ');
                // Create a list item for each ride
                rides.forEach(rideName => {
                    const li = document.createElement('li');
                    li.textContent = rideName;
                    ridesList.appendChild(li);
                });
            } else {
                ridesList.innerHTML = '<li>No rides listed for this park.</li>';
            }
        }

    } else {
        document.getElementById('park-details').innerHTML = '<p>Park not found.</p>';
    }
});