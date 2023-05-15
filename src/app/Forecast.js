"use client";
import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [celsius, setCelsius] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const kelvinToCelsius = (data) => {
    const constantKelvin = 273.15;
    const currentCelsius = parseInt(data - constantKelvin, 10);
    setCelsius(currentCelsius);
  };

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      kelvinToCelsius(response.data.main.feels_like);
      setWeather(response.data);
      console.log(response.data);
    } catch (error) {
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={fetchWeather}>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        weather && (
          <div>
            <h3>{weather.name}</h3>
            <p>{weather.weather[0].description}</p>
            <p>{celsius}°C</p>
            <img
              src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
              alt="Weather icon"
            />
          </div>
        )
      )}
    </div>
  );
};
export default Home;
