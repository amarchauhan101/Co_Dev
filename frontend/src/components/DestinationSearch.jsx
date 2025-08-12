import React from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

function DestinationSearch({ onSelect }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Restrict suggestions to India
      componentRestrictions: { country: "in" },
    },
    debounce: 300,
  });

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (description) => {
    setValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = getLatLng(results[0]);
      console.log("Fetched destination coordinates:", { lat, lng });
      onSelect({ lat, lng });
    } catch (error) {
      console.error("Error fetching destination coordinates:", error);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Enter Destination"
        className="border p-2 w-full rounded"
      />
      {status === "OK" && (
        <ul className="bg-white shadow-md rounded mt-2 max-h-60 overflow-y-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DestinationSearch;
