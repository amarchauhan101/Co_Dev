import { useState, useEffect } from 'react';

const API_KEY = 'fsq3upkrhzT/rOBmZ0FSeaIRALWB+vcCbU6I0i6CyHsAywg=';

export default function NearbyPlaces() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [category, setCategory] = useState('tourist_attraction');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const lat = latitude.toFixed(5);
        const lng = longitude.toFixed(5);
        setLocation({ lat, lng });
        fetchPlaces(lat, lng, category);
      }, (error) => console.error('Geolocation error:', error), { enableHighAccuracy: true });
    } else {
      console.error('Geolocation not supported.');
    }
  }, [category]);

  const fetchPlaces = (lat, lng, category) => {
    const categories = {
      tourist_attraction: '16025',
      hospital: '15014',
      restaurant: '13065',
    };

    const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&radius=5000&categories=${categories[category]}&limit=20`;

    fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: API_KEY,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPlaces(data.results || []);
      })
      .catch((err) => console.error('Error fetching places:', err));
  };

  const generateStars = (rating) => {
    const sanitizedRating = Math.max(0, Math.min(5, Math.round(rating || (Math.random() * 2 + 3).toFixed(1))));
    return '⭐'.repeat(sanitizedRating) + '☆'.repeat(5 - sanitizedRating);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-gray-100 to-blue-100 min-h-screen flex flex-col items-center">
      <h2 className="text-5xl font-extrabold mb-6 text-center">🌍 Nearby Places to Visit</h2>

      <div className="mb-6 flex space-x-4">
        <button onClick={() => setCategory('tourist_attraction')} className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600">Tourist Attractions</button>
        <button onClick={() => setCategory('hospital')} className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600">Hospitals</button>
        <button onClick={() => setCategory('restaurant')} className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600">Restaurants</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 w-full max-w-6xl">
        {places.length === 0 ? <p>No places found.</p> : places.map((place) => (
          <div 
            key={place.fsq_id} 
            className="bg-white shadow-2xl rounded-2xl p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300" 
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.geocodes.main.latitude},${place.geocodes.main.longitude}`, '_blank')}
          >
            <img 
              src={place.photos && place.photos.length > 0
                ? `${place.photos[0].prefix}original${place.photos[0].suffix}`
                : 'https://via.placeholder.com/400x400?text=No+Image'} 
              alt={place.name} 
              className="rounded-t-2xl w-full h-72 object-cover mb-4" 
            />
            <div className="p-2">
              <h3 className="font-bold text-3xl mb-2">{place.name}</h3>
              <p className="text-lg text-gray-700">{place.location.address || 'Address not available'}</p>
              <p className="text-md mt-1">{generateStars(place.rating)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
