// import React, { useEffect, useState } from "react";
// import { GoogleMap, LoadScript, DirectionsRenderer } from "@react-google-maps/api";

// function ReactGoogleMap() {
//   // States for the directions response and error message
//   const [directionsResponse, setDirectionsResponse] = useState(null);
//   const [error, setError] = useState(null);

//   // States for latitude and longitude input values
//   const [lat, setLat] = useState("19.0760");
//   const [lng, setLng] = useState("72.8777");

//   // This state triggers a fetch when updated
//   const [submittedCoords, setSubmittedCoords] = useState({ lat, lng });

//   // Function to fetch directions using provided coordinates
//   const fetchDirections = async (latitude, longitude) => {
//     try {
//       const response = await fetch(
//         `http://localhost:8000/api/v1/traffic/get-traffic?lat=${latitude}&lng=${longitude}`
//       );
//       const data = await response.json();
//       console.log("Fetched data:", data);

//       if (data.status !== "OK") {
//         throw new Error("Failed to fetch directions");
//       }
//       setDirectionsResponse(data);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error("Error:", err);
//       setDirectionsResponse(null);
//     }
//   };

//   // Get user's current location on component mount
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const currentLat = position.coords.latitude.toString();
//           const currentLng = position.coords.longitude.toString();
//           setLat(currentLat);
//           setLng(currentLng);
//           setSubmittedCoords({ lat: currentLat, lng: currentLng });
//         },
//         (err) => {
//           console.error("Geolocation error:", err);
//           // Fall back to default coordinates if permission is denied or there's an error
//           setError("Unable to fetch current location, using default coordinates.");
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by this browser.");
//     }
//   }, []);

//   // Fetch directions when submitted coordinates change
//   useEffect(() => {
//     fetchDirections(submittedCoords.lat, submittedCoords.lng);
//   }, [submittedCoords]);

//   // Google Map container style and center
//   const containerStyle = {
//     width: "100%",
//     height: "600px",
//   };

//   const center = {
//     lat: parseFloat(submittedCoords.lat),
//     lng: parseFloat(submittedCoords.lng),
//   };

//   // Handle form submission to update coordinates
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setSubmittedCoords({ lat, lng });
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">Choose Coordinates for Route</h1>

//       {/* Form for user to enter coordinates */}
//       <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-4">
//         <div>
//           <label htmlFor="lat" className="block font-semibold">Latitude:</label>
//           <input
//             id="lat"
//             type="text"
//             value={lat}
//             onChange={(e) => setLat(e.target.value)}
//             className="border p-2 rounded w-full"
//           />
//         </div>
//         <div>
//           <label htmlFor="lng" className="block font-semibold">Longitude:</label>
//           <input
//             id="lng"
//             type="text"
//             value={lng}
//             onChange={(e) => setLng(e.target.value)}
//             className="border p-2 rounded w-full"
//           />
//         </div>
//         <div className="flex items-end">
//           <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//             Get Route
//           </button>
//         </div>
//       </form>

//       {/* Display error message if exists */}
//       {error && <p className="text-red-600 mb-4">{error}</p>}

//       {/* Google Map with DirectionsRenderer */}
//       <LoadScript googleMapsApiKey={"AIzaSyA_MzVE_f0ciwnRT9jXVY3ANMBYC3Slfmg"}>
//         <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
//           {directionsResponse && (
//             <DirectionsRenderer
//               directions={directionsResponse}
//               options={{
//                 polylineOptions: {
//                   strokeColor: "#1976D2",
//                   strokeOpacity: 0.8,
//                   strokeWeight: 5,
//                 },
//                 markerOptions: {
//                   icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//                 },
//               }}
//             />
//           )}
//         </GoogleMap>
//       </LoadScript>
//     </div>
//   );
// }

// export default ReactGoogleMap;


// import React, { useEffect, useState } from "react";
// import { GoogleMap, LoadScript, DirectionsRenderer, Marker, InfoWindow } from "@react-google-maps/api";

// function ReactGoogleMap() {
//   const [directionsResponse, setDirectionsResponse] = useState(null);
//   const [error, setError] = useState(null);
  
//   // Optional: State to display info windows for markers if desired
//   const [selectedMarker, setSelectedMarker] = useState(null);
  
//   // Fetch directions from your backend (which returns the Google Directions API response)
//   const fetchDirections = async () => {
//     try {
//       const response = await fetch(
//         "http://localhost:8000/api/v1/traffic/get-traffic?lat=19.0760&lng=72.8777"
//       );
//       const data = await response.json();
//       console.log("Fetched data:", data);
      
//       if (data.status !== "OK") {
//         throw new Error("Failed to fetch directions");
//       }
//       setDirectionsResponse(data);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error("Error:", err);
//       setDirectionsResponse(null);
//     }
//   };

//   useEffect(() => {
//     fetchDirections();
//   }, []);

//   // Map container style and center (using start_location from the first leg if available)
//   const containerStyle = {
//     width: "100%",
//     height: "600px",
//   };

//   let center = { lat: 19.0760, lng: 72.8777 };
//   if (
//     directionsResponse &&
//     directionsResponse.routes &&
//     directionsResponse.routes[0] &&
//     directionsResponse.routes[0].legs &&
//     directionsResponse.routes[0].legs[0]
//   ) {
//     center = directionsResponse.routes[0].legs[0].start_location;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">Route on Map</h1>
//       {error && <p className="text-red-600 mb-4">{error}</p>}
//       <LoadScript googleMapsApiKey={"AIzaSyA_MzVE_f0ciwnRT9jXVY3ANMBYC3Slfmg"}>
//         <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
//           {directionsResponse && (
//             <DirectionsRenderer
//               directions={directionsResponse}
//               options={{
//                 polylineOptions: {
//                   strokeColor: "#1976D2",
//                   strokeOpacity: 0.8,
//                   strokeWeight: 5,
//                 },
//                 markerOptions: {
//                   icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//                 },
//               }}
//             />
//           )}
//           {/* Optionally, if you want to show markers for each geocoded waypoint */}
//           {directionsResponse &&
//             directionsResponse.geocoded_waypoints &&
//             directionsResponse.geocoded_waypoints.map((waypoint, index) => {
//               // For example, use the leg's start or end location for markers.
//               // Here we'll show a marker for the start location of the leg.
//               const leg = directionsResponse.routes[0].legs[0];
//               const markerPosition =
//                 index === 0 ? leg.start_location : leg.end_location;
//               return (
//                 <Marker
//                   key={index}
//                   position={markerPosition}
//                   onClick={() => setSelectedMarker({ position: markerPosition, index })}
//                 />
//               );
//             })}
//           {selectedMarker && (
//             <InfoWindow
//               position={selectedMarker.position}
//               onCloseClick={() => setSelectedMarker(null)}
//             >
//               <div>
//                 <p>
//                   {selectedMarker.index === 0
//                     ? "Start Location"
//                     : "End Location"}
//                 </p>
//               </div>
//             </InfoWindow>
//           )}
//         </GoogleMap>
//       </LoadScript>
//     </div>
//   );
// }

// export default ReactGoogleMap;



// import React, { useEffect, useState } from "react";
// import {
//   GoogleMap,
//   LoadScript,
//   DirectionsRenderer,
// } from "@react-google-maps/api";

// function ReactGoogleMap() {
//   // State for route directions and error message
//   const [directionsResponse, setDirectionsResponse] = useState(null);
//   const [error, setError] = useState(null);

//   // State for the source (current location) and destination coordinates
//   const [source, setSource] = useState({ lat: 19.0760, lng: 72.8777 });
//   const [destLat, setDestLat] = useState("");
//   const [destLng, setDestLng] = useState("");

//   // On component mount, fetch the user's current location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const currentLat = position.coords.latitude;
//           const currentLng = position.coords.longitude;
//           setSource({ lat: currentLat, lng: currentLng });
//         },
//         (err) => {
//           console.error("Geolocation error:", err);
//           setError("Unable to fetch current location; using default coordinates.");
//           // Defaults are already set in state above
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by this browser.");
//     }
//   }, []);

//   // Function to fetch directions from the backend using source and destination coordinates
//   const fetchDirections = async (srcLat, srcLng, destLat, destLng) => {
//     try {
//       // Ensure your backend accepts these parameters: lat, lng for source and destLat, destLng for destination
//       const response = await fetch(
//         `http://localhost:8000/api/v1/traffic/get-traffic?lat=${srcLat}&lng=${srcLng}&destLat=${destLat}&destLng=${destLng}`
//       );
//       const data = await response.json();
//       console.log("Fetched data:", data);

//       if (data.status !== "OK") {
//         throw new Error("Failed to fetch directions");
//       }
//       setDirectionsResponse(data);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error("Error:", err);
//       setDirectionsResponse(null);
//     }
//   };

//   // Handle form submission to fetch directions using the current source and entered destination
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!destLat || !destLng) {
//       setError("Please enter valid destination coordinates.");
//       return;
//     }
//     fetchDirections(source.lat, source.lng, destLat, destLng);
//   };

//   // Map container style and center (centered at the source location)
//   const containerStyle = {
//     width: "100%",
//     height: "600px",
//   };

//   const center = {
//     lat: source.lat,
//     lng: source.lng,
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">Route on Map</h1>

//       {/* Display current (source) location */}
//       <div className="mb-4">
//         <p className="font-semibold">Your Current Location:</p>
//         <p>Latitude: {source.lat}</p>
//         <p>Longitude: {source.lng}</p>
//       </div>

//       {/* Form for user to enter destination coordinates */}
//       <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-4">
//         <div>
//           <label htmlFor="destLat" className="block font-semibold">
//             Destination Latitude:
//           </label>
//           <input
//             id="destLat"
//             type="text"
//             value={destLat}
//             onChange={(e) => setDestLat(e.target.value)}
//             className="border p-2 rounded w-full"
//             placeholder="Enter destination latitude"
//           />
//         </div>
//         <div>
//           <label htmlFor="destLng" className="block font-semibold">
//             Destination Longitude:
//           </label>
//           <input
//             id="destLng"
//             type="text"
//             value={destLng}
//             onChange={(e) => setDestLng(e.target.value)}
//             className="border p-2 rounded w-full"
//             placeholder="Enter destination longitude"
//           />
//         </div>
//         <div className="flex items-end">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//           >
//             Get Route
//           </button>
//         </div>
//       </form>

//       {/* Display error message if exists */}
//       {error && <p className="text-red-600 mb-4">{error}</p>}

//       {/* Render Google Map with Directions */}
//       <LoadScript googleMapsApiKey={"AIzaSyA_MzVE_f0ciwnRT9jXVY3ANMBYC3Slfmg"}>
//         <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
//           {directionsResponse && (
//             <DirectionsRenderer
//               directions={directionsResponse}
//               options={{
//                 polylineOptions: {
//                   strokeColor: "#1976D2",
//                   strokeOpacity: 0.8,
//                   strokeWeight: 5,
//                 },
//                 markerOptions: {
//                   icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//                 },
//               }}
//             />
//           )}
//         </GoogleMap>
//       </LoadScript>
//     </div>
//   );
// }

// export default ReactGoogleMap;




import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";

function ReactGoogleMap() {
  // State for route directions and error message
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [error, setError] = useState(null);

  // State for the source (current location) and destination coordinates
  const [source, setSource] = useState({ lat: 19.0760, lng: 72.8777 });
  const [destLat, setDestLat] = useState("");
  const [destLng, setDestLng] = useState("");

  // On component mount, fetch the user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          setSource({ lat: currentLat, lng: currentLng });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to fetch current location; using default coordinates.");
          // Defaults are already set in state above
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Function to fetch directions from the backend using source and destination coordinates
  const fetchDirections = async (srcLat, srcLng, destLat, destLng) => {
    try {
      // Ensure your backend accepts these parameters: lat, lng for source and destLat, destLng for destination
      const response = await fetch(
        `http://localhost:8000/api/v1/traffic/get-traffic?lat=${srcLat}&lng=${srcLng}&destLat=${destLat}&destLng=${destLng}`
      );
      const data = await response.json();
      console.log("Fetched data:", data);

      if (data.status !== "OK") {
        throw new Error("Failed to fetch directions");
      }
      setDirectionsResponse(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
      setDirectionsResponse(null);
    }
  };

  // Handle form submission to fetch directions using the current source and entered destination
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destLat || !destLng) {
      setError("Please enter valid destination coordinates.");
      return;
    }
    // Fetch directions using current source and entered destination
    fetchDirections(source.lat, source.lng, destLat, destLng);
  };

  // Map container style and center (centered at the source location)
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  const center = {
    lat: source.lat,
    lng: source.lng,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Route on Map</h1>

      {/* Display current (source) location */}
      <div className="mb-4">
        <p className="font-semibold">Your Current Location:</p>
        <p>Latitude: {source.lat}</p>
        <p>Longitude: {source.lng}</p>
      </div>

      {/* Form for user to enter destination coordinates */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col md:flex-row gap-4">
        <div>
          <label htmlFor="destLat" className="block font-semibold">
            Destination Latitude:
          </label>
          <input
            id="destLat"
            type="text"
            value={destLat}
            onChange={(e) => setDestLat(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Enter destination latitude"
          />
        </div>
        <div>
          <label htmlFor="destLng" className="block font-semibold">
            Destination Longitude:
          </label>
          <input
            id="destLng"
            type="text"
            value={destLng}
            onChange={(e) => setDestLng(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Enter destination longitude"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Get Route
          </button>
        </div>
      </form>

      {/* Display error message if exists */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Render Google Map with Directions */}
      <LoadScript googleMapsApiKey={"AIzaSyA_MzVE_f0ciwnRT9jXVY3ANMBYC3Slfmg"}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                polylineOptions: {
                  strokeColor: "#1976D2",
                  strokeOpacity: 0.8,
                  strokeWeight: 5,
                },
                markerOptions: {
                  icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                },
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default ReactGoogleMap;


