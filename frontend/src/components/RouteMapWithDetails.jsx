// RouteMapWithDestination.jsx
import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
  TrafficLayer,
  HeatmapLayer,
} from "@react-google-maps/api";
import { FaCar, FaWalking, FaBus, FaBicycle, FaRoute } from "react-icons/fa";

const libraries = ["places"];

const travelModes = [
  { mode: "DRIVING", label: "Drive", icon: <FaCar />, color: "bg-blue-100" },
  {
    mode: "WALKING",
    label: "Walk",
    icon: <FaWalking />,
    color: "bg-green-100",
  },
  {
    mode: "TRANSIT",
    label: "Public Transport",
    icon: <FaBus />,
    color: "bg-yellow-100",
  },
  {
    mode: "BICYCLING",
    label: "Bike",
    icon: <FaBicycle />,
    color: "bg-purple-100",
  },
  {
    mode: "SCENIC",
    label: "Scenic Route",
    icon: <FaRoute />,
    color: "bg-pink-100",
  },
];

function RouteMapWithDestination() {
  const [error, setError] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [destination, setDestination] = useState({
    name: "",
    lat: null,
    lng: null,
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directionsResponses, setDirectionsResponses] = useState({});
  const [activeRoute, setActiveRoute] = useState({ mode: "DRIVING", index: 0 });
  const [loading, setLoading] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => setError("Enable location access to use this feature")
    );
  }, []);

  const onLoad = (autocompleteInstance) => {
    autocompleteInstance.setComponentRestrictions({ country: "in" });
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (place.geometry) {
      setDirectionsResponses({});
      setActiveRoute({ mode: "DRIVING", index: 0 });
      setDestination({
        name: place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  // Modified to store the entire response
  const directionsCallback = (response, status, mode) => {
    if (status === "OK" && response) {
      setDirectionsResponses((prev) => ({
        ...prev,
        [mode]: response,
      }));
    } else {
      // console.log(`Directions request failed for ${mode}: ${status}`);
    }
  };

  const fetchMapData = () => {
    if (!destination.lat || !currentLocation) {
      setError("Please select a valid destination");
      return;
    }
    setLoading(true);
    setError(null);
    setFetchTrigger(Date.now());
    setLoading(false);
  };

  const determineTrafficLevel = (mode, route) => {
    if (mode === "WALKING" || mode === "BICYCLING") return "low";
    const duration = route.legs[0].duration.value;
    if (duration < 900) return "low";
    if (duration < 1800) return "medium";
    return "high";
  };

  const renderTravelCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {travelModes.map(({ mode, label, icon, color }) => {
          const response = directionsResponses[mode];
          if (!response?.routes) return null;
          return response.routes.map((route, index) => {
            const { duration, distance } = route.legs[0];
            const trafficLevel = determineTrafficLevel(mode, route);
            return (
              <div
                key={`${mode}-${index}`}
                className={`${color} p-4 rounded-lg shadow-lg transition-transform hover:scale-105 cursor-pointer border ${
                  activeRoute.mode === mode && activeRoute.index === index
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
                onClick={() => setActiveRoute({ mode, index })}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{icon}</span>
                  <h3 className="font-bold text-lg">
                    {label} Route {index + 1}
                  </h3>
                </div>
                <p className="text-gray-700">⏳ {duration.text}</p>
                <p className="text-gray-600">📏 {distance.text}</p>
                <p className="text-gray-800">Traffic: {trafficLevel}</p>
              </div>
            );
          });
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          Smart Route Planner
        </h1>
        <p className="text-gray-600">
          Find the best way to reach your destination
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <LoadScript
          googleMapsApiKey="AIzaSyA_MzVE_f0ciwnRT9jXVY3ANMBYC3Slfmg"
          libraries={libraries}
        >
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    placeholder="Where to?"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </Autocomplete>
              </div>
            </div>

            <button
              onClick={fetchMapData}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {loading ? "Calculating Routes..." : "Find Best Route"}
            </button>
          </div>

          {error && (
            <div className="text-red-600 p-4 bg-red-50 rounded-lg mb-6">
              {error}
            </div>
          )}

          {renderTravelCards()}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "500px" }}
              // Conditionally set center and zoom only when no routes are present
              center={
                Object.keys(directionsResponses).length === 0
                  ? currentLocation || { lat: 19.3836115, lng: 72.8288877 }
                  : undefined
              }
              zoom={
                Object.keys(directionsResponses).length === 0 ? 14 : undefined
              }
              options={{ disableDefaultUI: true }}
            >
              
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeWeight: 2,
                  }}
                />
              )}

              {destination.lat && (
                <Marker
                  position={{ lat: destination.lat, lng: destination.lng }}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }}
                />
              )}

              <TrafficLayer autoUpdate />

              {destination.lat &&
                currentLocation &&
                travelModes.map(({ mode }) => (
                  <DirectionsService
                    key={`${mode}-${fetchTrigger}`}
                    options={{
                      destination: {
                        lat: destination.lat,
                        lng: destination.lng,
                      },
                      origin: currentLocation,
                      travelMode: mode === "SCENIC" ? "DRIVING" : mode,
                      provideRouteAlternatives: true,
                      drivingOptions: {
                        departureTime: new Date(),
                        trafficModel: "bestguess",
                      },
                    }}
                    callback={(res, status) =>
                      directionsCallback(res, status, mode)
                    }
                  />
                ))}

              {Object.keys(directionsResponses).length > 0 &&
                directionsResponses[activeRoute.mode] && (
                  <DirectionsRenderer
                    options={{
                      directions: directionsResponses[activeRoute.mode],
                      routeIndex: activeRoute.index,
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor:
                          activeRoute.mode === "DRIVING"
                            ? "#1a73e8"
                            : "#34a853",
                        strokeWeight: 5,
                      },
                    }}
                  />
                )}
            </GoogleMap>
          </div>
        </LoadScript>
      </div>
    </div>
  );
}

export default RouteMapWithDestination;
