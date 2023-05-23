"use client";
import styles from "./styles/forecast.module.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [todayDaytime, setTodayDaytime] = useState({
    month: null,
    day: null,
    weekday: null,
    hour: null,
    period: null,
  });

  //今日の月日時間を取得データから変換
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      };

      const dateTimeFormat = new Intl.DateTimeFormat("ja-JP", options);
      const [
        { value: month },
        ,
        { value: day },
        ,
        { value: weekday },
        ,
        { value: hour },
      ] = dateTimeFormat.formatToParts(now);

      // Convert to 12-hour format manually
      const hour24 = parseInt(hour, 10);
      let hour12 = hour24 <= 12 ? hour24 : hour24 - 12;

      // Determine if it's AM or PM
      let period = hour24 < 12 ? "午前" : "午後";

      setTodayDaytime({
        month,
        day,
        weekday,
        hour: hour12.toString(),
        period, // set AM/PM
      });
    };

    // Initial load
    updateDateTime();

    // Subsequent updates every minute
    const intervalId = setInterval(updateDateTime, 60 * 1000);

    // Cleanup function to clear the interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  const kelvinToCelsius = (kelvin) => parseInt(kelvin - 273.15, 10);

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const encodedCity = encodeURIComponent(city);

      const response = await axios.get(
        `${WEATHER_API_BASE_URL}${encodedCity}&appid=${process.env.NEXT_PUBLIC_API_KEY}&lang=ja`
      );
      setWeather({
        ...response.data,
        main: {
          ...response.data.main,
          feels_like: kelvinToCelsius(response.data.main.feels_like),
        },
      });

      const responseFiveDays = await axios.get(
        `${FORECAST_API_BASE_URL}${encodedCity}&appid=${process.env.NEXT_PUBLIC_API_KEY}&lang=ja`
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
              <div className={styles.todayResultCity}>
                <div>
                  <p>
                    {todayDaytime.month} 月{todayDaytime.day} 日
                    {todayDaytime.weekday} 　{todayDaytime.period}
                    {todayDaytime.hour} 時　
                    {weather.name}　の天気
                  </p>
                </div>
              </div>
              <div className={styles.todayResultDay}>
                <img
                  src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
                  alt="Weather icon"
                />
                <span>{weather.main.feels_like}°C</span>

                <div className={styles.resultImgContainer}>
                  <img
                    src={clothesImage(weather.main.feels_like)}
                    alt="Appropriate clothes"
                  />
                </div>
              </div>

              <h4>5 Days Forecast:</h4>
              {forecast.map((info, index) => (
                <p key={index}>
                  {info.time} - {info.weather} - {info.tempCelsius} ℃
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
