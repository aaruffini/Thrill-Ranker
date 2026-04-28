import { supabase } from '../../supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get the park ID from the URL
    const params = new URLSearchParams(window.location.search);
    const parkID = params.get('id');

    if (!parkID) {
        document.getElementById('park-name').textContent = 'No park specified.';
        return;
    }

    // Call the custom SQL function 'get_park_details'
    const { data: park, error } = await supabase
        .rpc('get_park_details', { park_id_param: parkID })
        .single();

    if (error) {
        console.error('Error fetching park details:', error);
        document.getElementById('park-name').textContent = 'Could not fetch park details.';
        return;
    }

    if (park) {
        document.getElementById('park-name').textContent = park.name || 'N/A';
        document.getElementById('park-city').textContent = park.city || 'N/A';
        document.getElementById('park-state').textContent = park.state || 'N/A';

        const { data: parkLocation, error: locationError } = await supabase
            .from('parks')
            .select('location:location::geometry')
            .eq('id', parkID)
            .single();

        if (locationError) {
            console.error('Error fetching park location:', locationError);
            document.getElementById('park-map-empty').textContent = 'Map location unavailable.';
        } else if (parkLocation?.location?.coordinates) {
            const [longitude, latitude] = parkLocation.location.coordinates;
            const parkMap = L.map('park-map').setView([latitude, longitude], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(parkMap);

            L.marker([latitude, longitude]).addTo(parkMap)
                .bindPopup(park.name || 'Park')
                .openPopup();

            document.getElementById('park-map-empty').textContent = '';
        } else {
            document.getElementById('park-map-empty').textContent = 'Map location unavailable.';
        }

        const { data: rides, error: ridesError } = await supabase
            .from('ride')
            .select('id, name')
            .eq('park_id', parkID)
            .order('name', { ascending: true });

        if (ridesError) {
            console.error('Error fetching park rides:', ridesError);
            document.getElementById('park-ride-count').textContent = '0';
            document.getElementById('park-rides-empty').textContent = 'Could not load rides for this park.';
            return;
        }

        const parkRides = rides || [];
        document.getElementById('park-ride-count').textContent = parkRides.length;

        const ridesList = document.getElementById('park-rides-list');
        const emptyState = document.getElementById('park-rides-empty');

        if (ridesList) {
            ridesList.innerHTML = '';

            if (parkRides.length > 0) {
                emptyState.textContent = '';
                parkRides.forEach(ride => {
                    const rideLink = document.createElement('a');
                    rideLink.className = 'ride-pill';
                    rideLink.href = `../../Ride_page/ride_page.html?id=${ride.id}`;
                    rideLink.textContent = ride.name;
                    ridesList.appendChild(rideLink);
                });
            } else {
                emptyState.textContent = 'No rides listed for this park.';
            }
        }

    } else {
        document.getElementById('park-name').textContent = 'Park not found.';
    }
});