import { supabase } from '../supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get the ride ID from the URL
    const params = new URLSearchParams(window.location.search);
    const rideId = params.get('id');

    if (!rideId) {
        document.getElementById('ride-details').innerHTML = '<p>No ride specified.</p>';
        return;
    }

    // Call the custom SQL function 'get_ride_details_v3'
    const { data: ride, error } = await supabase
        .rpc('get_ride_details_v3', { ride_id_param: rideId })
        .single();

    if (error) {
        console.error('Error fetching ride details:', error);
        document.getElementById('ride-details').innerHTML = '<p>Could not fetch ride details. Check console for errors.</p>';
        return;
    }

    if (ride) {
        console.log('Ride data from database:', ride); // Log the returned object
        // Populate the page with the data from the function

        // ride
        document.getElementById('ride-name').textContent = ride.ride_name || 'N/A';
        document.getElementById('ride-park').textContent = ride.park_name || 'N/A';
        document.getElementById('ride-manufacturer').textContent = ride.manufacturer_name || 'N/A';
        document.getElementById('ride-model').textContent = ride.model_name || 'v2';
         document.getElementById('ride-inversions').textContent = ride.inversions || '0';
        document.getElementById('ride-lift-system').textContent = ride.lift_system_name || 'NA';

        // nullable values - height, speed, time
        document.getElementById('ride-height').textContent = ride.height || 'NA';
        if(ride.height == -1)
            {
                document.getElementById('ride-height').textContent = 'N/A'

            }
        document.getElementById('ride-speed').textContent = ride.speed || 'NA';
        if(ride.speed == -1)
            {
                document.getElementById('ride-speed').textContent = 'N/A'

            }
        document.getElementById('ride-time').textContent = ride.ride_time || 'NA';
        if(ride.ride_time == -1){
            document.getElementById('ride-time').textContent = 'N/A'
        }
        
       
        // voting info
        document.getElementById('green_count').textContent = ride.green_count ?? '0';
        document.getElementById('blue_count').textContent = ride.blue_count ?? '0';
        document.getElementById('black_count').textContent = ride.black_count ?? '0';
        document.getElementById('double_black_count').textContent = ride.double_black_count ?? '0';

        // gis info (function returns `long` and `lat`)
        document.getElementById('longitude').textContent = (ride.long !== null && ride.long !== undefined) ? ride.long : 'NA';
        document.getElementById('latitude').textContent = (ride.lat !== null && ride.lat !== undefined) ? ride.lat : 'NA';

        // Initialize map if lat/long available
        if (ride.lat && ride.long) {
            const map = L.map('map').setView([ride.long, ride.lat], 15); //leaflet flips them for whatever reason ;0

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            L.marker([ride.long, ride.lat]).addTo(map)
                .bindPopup(ride.ride_name)
                .openPopup();
        }
        // Set ride image: prefer an Images file named after the ride (spaces -> _), fallback to temp.jpg
        try {
            const rideImageEl = document.getElementById('ride-image');
            if (rideImageEl) {
                const cleanName = (ride.ride_name || '').replace(/\s+/g, '_');
                const candidate = `../Images/${cleanName}.jpg`;
                // quick existence check by creating Image object
                const img = new Image();
                img.onload = () => { rideImageEl.src = candidate; };
                img.onerror = () => { rideImageEl.src = '../Images/temp.jpg'; };
                img.src = candidate;
                rideImageEl.alt = `Image of ${ride.ride_name || 'ride'}`;
            }
        } catch (e) {
            console.warn('Error setting ride image', e);
        }

        // Modal logic
        const modal = document.getElementById('info-modal');
        if (modal) {
            const closeButton = document.querySelector('.close-button');
            const modalTitle = document.getElementById('modal-title');
            const modalDescription = document.getElementById('modal-description');
            const modelLink = document.getElementById('ride-model-link');
            const liftSystemLink = document.getElementById('ride-lift-system-link');

            if (modelLink) {
                modelLink.onclick = async (e) => {
                    e.preventDefault();
                    if (ride && ride.model_id) {
                        const { data, error } = await supabase.rpc('get_ride_model_detail', { model_id_param: ride.model_id }).single();
                        if (error) {
                            console.error('Error fetching model details:', error);
                            modalTitle.textContent = ride.model_name;
                            modalDescription.textContent = 'Could not fetch model details.';
                        } else if (data) {
                            modalTitle.textContent = ride.model_name;
                            modalDescription.textContent = data.description || 'No description available.';
                        }
                        modal.style.display = 'block';
                    } else {
                        modalTitle.textContent = 'Error';
                        modalDescription.textContent = 'Model ID not found.';
                        modal.style.display = 'block';
                    }
                };
            }

            if (liftSystemLink) {
                liftSystemLink.onclick = async (e) => {
                    e.preventDefault();
                    const { data, error } = await supabase.from('lift_systems').select('description').eq('lift_system_name', ride.lift_system_name).single();
                    if (data) {
                        modalTitle.textContent = ride.lift_system_name;
                        modalDescription.textContent = data.description || 'No description available.';
                        modal.style.display = 'block';
                    }
                };
            }

            if (closeButton) {
                closeButton.onclick = () => {
                    modal.style.display = 'none';
                };
            }

            window.onclick = (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
        }

        // Voting logic
        const voteButtons = {
            green: document.getElementById('vote-green'),
            blue: document.getElementById('vote-blue'),
            black: document.getElementById('vote-black'),
            doubleBlack: document.getElementById('vote-double-black')
        };
        const voteFeedback = document.getElementById('vote-feedback');

        voteButtons.green.addEventListener('click', () => handleVote('green'));
        voteButtons.blue.addEventListener('click', () => handleVote('blue'));
        voteButtons.black.addEventListener('click', () => handleVote('black'));
        voteButtons.doubleBlack.addEventListener('click', () => handleVote('double_black'));

        async function handleVote(voteType) {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                voteFeedback.textContent = 'You must be logged in to vote. Please sign in or create an account.';
                voteFeedback.style.display = 'block';
                // Optionally, redirect to login page after a delay
                // setTimeout(() => { window.location.href = '/authentication.html'; }, 3000);
                return;
            }

            const { data, error } = await supabase.rpc('handle_user_vote', { p_ride_id: rideId, p_vote_type: voteType });
            
            if (error) {
                console.error('Error voting:', error);
                voteFeedback.textContent = `An error occurred: ${error.message}`;
                voteFeedback.style.display = 'block';
            } else if (data) {
                const updatedCounts = data[0];
                document.getElementById('green_count').textContent = updatedCounts.green_count;
                document.getElementById('blue_count').textContent = updatedCounts.blue_count;
                document.getElementById('black_count').textContent = updatedCounts.black_count;
                document.getElementById('double_black_count').textContent = updatedCounts.double_black_count;

                voteFeedback.textContent = 'Your vote has been recorded!';
                voteFeedback.style.display = 'block';
                setTimeout(() => {
                    voteFeedback.style.display = 'none';
                }, 3000);
            }
        }

    } else {
        document.getElementById('ride-details').innerHTML = '<p>Ride not found.</p>';
    }
});