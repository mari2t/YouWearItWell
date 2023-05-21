"use client";
import styles from "./styles/forecast.module.css";
import React, { useState } from "react";
import axios from "axios";
import TranslateWeatherDescription from "./TranslateWeatherDescription";

// API base URLs
const WEATHER_API_BASE_URL =
  "http://api.openweathermap.org/data/2.5/weather?q=";
const FORECAST_API_BASE_URL =
  "http://api.openweathermap.org/data/2.5/forecast?q=";

const TEMPERATURE_CLOTHES_MAP = [
  { min: 26, image: "/img/nosleeve.jpg" },
  { min: 22, image: "/img/shortsleeve.jpg" },
  { min: 17, image: "/img/longsleeve.jpg" },
  { min: 12, image: "/img/sweater.jpg" },
  { min: 6, image: "/img/coat.jpg" },
  { min: null, image: "/img/glovesAndKnitHat.jpg" },
];

const Home = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const kelvinToCelsius = (kelvin) => parseInt(kelvin - 273.15, 10);

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const encodedCity = encodeURIComponent(city);

      const response = await axios.get(
        `${WEATHER_API_BASE_URL}${encodedCity}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      setWeather({
        ...response.data,
        main: {
          ...response.data.main,
          feels_like: kelvinToCelsius(response.data.main.feels_like),
        },
      });

      const responseFiveDays = await axios.get(
        `${FORECAST_API_BASE_URL}${encodedCity}&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      const newForecast = responseFiveDays.data.list.slice(0, 16).map((el) => ({
        time: el.dt_txt,
        weather: el.weather[0].description,
        tempCelsius: kelvinToCelsius(el.main.temp),
      }));
      setForecast(newForecast);
    } catch (error) {
      setError(`Failed to fetch weather data: ${error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // Choose appropriate clothes based on temperature
  const clothesImage = (temperature) => {
    for (let i = 0; i < TEMPERATURE_CLOTHES_MAP.length; i++) {
      const { min, image } = TEMPERATURE_CLOTHES_MAP[i];
      if (!min || temperature >= min) {
        return image;
      }
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.formContainer} onSubmit={fetchWeather}>
        <input
          className={styles.inputCity}
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button className={styles.buttonGetWether} type="submit">
          Get Weather
        </button>
      </form>
      <div className={styles.resultContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          weather && (
            <div className={styles.todayResultContainer}>
              <h3>{weather.name}</h3>
              <p>Today : {new Date().toLocaleString()} </p>
              <span>
                <TranslateWeatherDescription
                  description={weather.weather[0].description}
                />{" "}
                {weather.main.feels_like}°C
              </span>
              <div className={styles.resultImgContainer}>
                <img
                  src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
                  alt="Weather icon"
                />
                <img
                  src={clothesImage(weather.main.feels_like)}
                  alt="Appropriate clothes"
                />
              </div>

              <h4>5 Days Forecast:</h4>
              {forecast.map((info, index) => (
                <p key={index}>
                  {info.time} -{" "}
                  <TranslateWeatherDescription description={info.weather} /> -{" "}
                  {info.tempCelsius} ℃
                </p>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
