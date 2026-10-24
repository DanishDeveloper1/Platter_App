import React, { createContext, useContext, useEffect, useState } from "react";
import { nearestCity } from "../lib.js";
import { CITIES } from "../data.js";

const KEY = "platter_city";
const LocationContext = createContext(null);

function load() {
  try {
    const c = localStorage.getItem(KEY);
    return CITIES.includes(c) ? c : null;
  } catch { return null; }
}

export function LocationProvider({ children }) {
  const [city, setCityState] = useState(load);
  const [pickerOpen, setPickerOpen] = useState(() => load() === null); // first visit: ask
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState("");

  useEffect(() => {
    try { if (city) localStorage.setItem(KEY, city); } catch { /* ignore */ }
  }, [city]);

  function setCity(c) {
    setCityState(c);
    setPickerOpen(false);
    setDetectError("");
  }

  function detect() {
    setDetectError("");
    if (!navigator.geolocation) {
      setDetectError("Your browser can't share its location. Pick a city instead.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        const found = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (found) setCity(found);
        else setDetectError("We don't deliver to your area yet. Pick one of our cities instead.");
      },
      () => {
        setDetecting(false);
        setDetectError("We couldn't get your location. Pick a city instead.");
      },
      { timeout: 8000 }
    );
  }

  return (
    <LocationContext.Provider
      value={{
        city, setCity, detect, detecting, detectError,
        pickerOpen, openPicker: () => setPickerOpen(true), closePicker: () => city && setPickerOpen(false),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationCtx() {
  return useContext(LocationContext);
}
