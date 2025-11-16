import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
  TrafficLayer,
} from "@react-google-maps/api";
import DestinationSearch from "./DestinationSearch"; // Adjust the path if needed

function MapWithDestination() {
  // State for source (user's current location) and destination coordinates
  const [sourceCoords, setSourceCoords] = useState({
    lat: 19.3836115,
    lng: 72.8288877,
  });
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [error, setError] = useState(null);

  // Get user's current location as source
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got current location:", position.coords);
          setSourceCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Could not fetch current location, using default source.");
        }
      );
    }
  }, []);

  // Fetch destination coordinates using Place Details API
  const fetchDestinationCoords = async (placeId) => {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            key: "AIzaSyAyP4jeW4zDC2iTGvMvA3XVdwCZeJC0WkI",
            place_id: placeId,
          },
        }
      );
      console.log("Place details response:", response.data);
      const location = response.data.result.geometry.location;
      return location;
    } catch (err) {
      console.error("Error fetching place details:", err);
      setError("Failed to get destination coordinates.");
      return null;
    }
  };

  // Fetch directions from your backend using source and destination coordinates
  const fetchDirections = async (src, dest) => {
    try {
      // Log the parameters for debugging
      console.log("Fetching directions for:", src, dest);
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL}/api/v1/traffic/get-traffic?lat=${src.lat}&lng=${src.lng}&destLat=${dest.lat}&destLng=${dest.lng}`
      );
      const data = await response.json();
      console.log("Fetched directions data:", data);
      if (data.status !== "OK") {
        throw new Error("Failed to fetch directions from backend");
      }
      setDirectionsResponse(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching directions:", err);
      setError(err.message);
      setDirectionsResponse(null);
    }
  };

  // Callback for when user selects a destination from autocomplete
  const handleDestinationSelect = async (selected) => {
    console.log(selected && selected.value && selected.value.place_id);
    if (selected && selected.value && selected.value.place_id) {
      const destCoords = await fetchDestinationCoords(selected.value.place_id);
      console.log(destCoords);
      if (destCoords) {
        setDestinationCoords(destCoords);
        fetchDirections(sourceCoords, destCoords);
      }
    }
  };

  // Map container style and center calculation
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  let center = sourceCoords;
  if (destinationCoords) {
    // Optionally, center at the midpoint
    center = {
      lat: (sourceCoords.lat + destinationCoords.lat) / 2,
      lng: (sourceCoords.lng + destinationCoords.lng) / 2,
    };
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Find Your Route</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Destination Search Input */}
      <DestinationSearch onSelect={handleDestinationSelect} />

      <LoadScript googleMapsApiKey={"AIzaSyAyP4jeW4zDC2iTGvMvA3XVdwCZeJC0WkI"}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
          <TrafficLayer autoUpdate={true} />
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                polylineOptions: {
                  strokeColor: "#1976D2",
                  strokeOpacity: 0.8,
                  strokeWeight: 5,
                },
                suppressMarkers: false,
              }}
            />
          )}
          <Marker
            position={sourceCoords}
            icon="https://maps.google.com/mapfiles/kml/paddle/grn-circle.png"
            title="Your Location"
          />
          {destinationCoords && (
            <Marker
              position={destinationCoords}
              icon="https://maps.google.com/mapfiles/kml/paddle/red-circle.png"
              title="Destination"
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default MapWithDestination;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   GoogleMap,
//   LoadScript,
//   DirectionsRenderer,
//   Marker,
//   TrafficLayer,
// } from "@react-google-maps/api";
// import DestinationSearch from "./DestinationSearch"; // Adjust the path if needed

// function MapWithDestination() {
//   const [sourceCoords, setSourceCoords] = useState({
//     lat: 19.3836115,
//     lng: 72.8288877,
//   });
//   const [destinationCoords, setDestinationCoords] = useState(null);
//   const [directionsResponse, setDirectionsResponse] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setSourceCoords({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           });
//         },
//         (err) => {
//           console.error("Geolocation error:", err);
//           setError("Could not fetch current location, using default source.");
//         }
//       );
//     }
//   }, []);

//   const fetchDestinationCoords = async (placeId) => {
//     try {
//       if (!placeId) throw new Error("Place ID is undefined");

//       const response = await axios.get(
//         "https://maps.googleapis.com/maps/api/place/details/json",
//         {
//           params: {
//             key: "AIzaSyAyP4jeW4zDC2iTGvMvA3XVdwCZeJC0WkI", // Replace with your API key
//             place_id: placeId,
//           },
//         }
//       );

//       if (response.data.status !== "OK") {
//         throw new Error(`API Error: ${response.data.status}`);
//       }

//       const location = response.data.result.geometry?.location;
//       if (!location) {
//         throw new Error("No geometry data found in place details");
//       }

//       return location;
//     } catch (err) {
//       console.error("Error fetching place details:", err);
//       setError(err.message);
//       return null;
//     }
//   };

//   const fetchDirections = async (src, dest) => {
//     try {
//       if (!src || !dest) {
//         throw new Error("Source or destination is missing");
//       }

//       const response = await fetch(
//         `http://localhost:8000/api/v1/traffic/get-traffic?lat=${src.lat}&lng=${src.lng}&destLat=${dest.lat}&destLng=${dest.lng}`
//       );

//       const data = await response.json();
//       if (data.status !== "OK") {
//         throw new Error("Failed to fetch directions from backend");
//       }

//       setDirectionsResponse(data);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching directions:", err);
//       setError(err.message);
//       setDirectionsResponse(null);
//     }
//   };

//   const handleDestinationSelect = async (selected) => {
//     try {
//       const placeId = selected?.value?.place_id;
//       if (!placeId) {
//         throw new Error("Invalid destination selected");
//       }

//       const destCoords = await fetchDestinationCoords(placeId);
//       if (destCoords) {
//         setDestinationCoords(destCoords);
//         await fetchDirections(sourceCoords, destCoords);
//       }
//     } catch (err) {
//       console.error("Error in destination select:", err);
//       setError(err.message);
//     }
//   };

//   const containerStyle = {
//     width: "100%",
//     height: "600px",
//   };

//   let center = sourceCoords;
//   if (destinationCoords) {
//     center = {
//       lat: (sourceCoords.lat + destinationCoords.lat) / 2,
//       lng: (sourceCoords.lng + destinationCoords.lng) / 2,
//     };
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">Find Your Route</h1>
//       {error && <p className="text-red-600 mb-4">{error}</p>}
//       <DestinationSearch onSelect={handleDestinationSelect} />

//       <LoadScript googleMapsApiKey={"AIzaSyAyP4jeW4zDC2iTGvMvA3XVdwCZeJC0WkI"}>
//         <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
//           <TrafficLayer autoUpdate={true} />
//           {directionsResponse && (
//             <DirectionsRenderer
//               directions={directionsResponse}
//               options={{
//                 polylineOptions: {
//                   strokeColor: "#1976D2",
//                   strokeOpacity: 0.8,
//                   strokeWeight: 5,
//                 },
//                 suppressMarkers: false,
//               }}
//             />
//           )}
//           <Marker
//             position={sourceCoords}
//             icon="https://maps.google.com/mapfiles/kml/paddle/grn-circle.png"
//             title="Your Location"
//           />
//           {destinationCoords && (
//             <Marker
//               position={destinationCoords}
//               icon="https://maps.google.com/mapfiles/kml/paddle/red-circle.png"
//               title="Destination"
//             />
//           )}
//         </GoogleMap>
//       </LoadScript>
//     </div>
//   );
// }

// export default MapWithDestination;



