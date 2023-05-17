"use client";
import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [celsius, setCelsius] = useState(null);
  const [fiveDaysWeatherInformation, setFiveDaysWeatherInformation] = useState([
    null,
  ]);
  const [fiveDaysTimeInformation, setFiveDaysTimeInformation] = useState([
    null,
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //calculate kelvin to celsius
  function kelvinToCelsius(data) {
    const constantKelvin = 273.15;
    const currentCelsius = parseInt(data - constantKelvin, 10);
    setCelsius(currentCelsius);
  }

  //Converting weather forecast information into a form that can be shown
  const forecastToShow = (data) => {
    const fiveDaysGetTimeData = [];
    const fiveDaysGetWeatherData = [];
    data.forEach((element, index) => {
      if (index >= 0 && index <= 10) {
        fiveDaysGetTimeData.push(element.dt_txt);
        fiveDaysGetWeatherData.push(element.weather[0].description);
      }
    });

    setFiveDaysTimeInformation(fiveDaysGetTimeData);
    setFiveDaysWeatherInformation(fiveDaysGetWeatherData);
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

      const responseFiveDays = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      forecastToShow(responseFiveDays.data.list);
      console.log(responseFiveDays);
    } catch (error) {
      setError(`Failed to fetch weather data: ${error.message}`);
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
            <h4>Today:</h4>
            <h5>{new Date().toLocaleString()}</h5>
            <h4>5 Days Forecast:</h4>
            {fiveDaysWeatherInformation.map((info, index) => (
              <p key={index}>
                {fiveDaysTimeInformation[index]} - {info}
              </p>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Home;
