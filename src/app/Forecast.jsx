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
const TEMPERATURE_RAINCLOTHES_MAP = [
  { min: 26, image: "/img/nosleeve.jpg" },
  { min: 22, image: "/img/shortsleeveWithUmbrella.jpg" },
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
  const [twoDaysForecast, setTwoDaysForecast] = useState([]);

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

  //取得データの単位をkから℃へ変換
  const kelvinToCelsius = (kelvin) => parseInt(kelvin - 273.15, 10);

  //取得データのIDから雨、雪かを判定
  const judgeRainOrSnow = (id) => {
    let rainOrSnowData = null;
    if (id <= 700) {
      rainOrSnowData = 1;
      return rainOrSnowData;
    }
    rainOrSnowData = 0;
    return rainOrSnowData;
  };

  //お天気情報取得
  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const encodedCity = encodeURIComponent(city);

      //今日のデータを取得
      const response = await axios.get(
        `${WEATHER_API_BASE_URL}${encodedCity}&appid=${process.env.NEXT_PUBLIC_API_KEY}&lang=ja`
      );
      setWeather({
        ...response.data,
        main: {
          ...response.data.main,
          id: response.data.weather[0].id,
          feels_like: kelvinToCelsius(response.data.main.feels_like),
        },
        weather: {
          ...response.data.weather,
          id: response.data.weather[0].id,
        },
      });
      console.log(response);

      //5日間３時間ごとのデータを取得
      const responseFiveDays = await axios.get(
        `${FORECAST_API_BASE_URL}${encodedCity}&appid=${process.env.NEXT_PUBLIC_API_KEY}&lang=ja`
      );

      //直近16個のデータを格納
      const newForecast = responseFiveDays.data.list.slice(3, 11).map((el) => ({
        id: el.weather[0].id,
        time: el.dt_txt,
        weather: el.weather[0].description,
        tempCelsius: kelvinToCelsius(el.main.temp),
      }));
      console.log(newForecast);
      setForecast(newForecast);
    } catch (error) {
      setError(`Failed to fetch weather data: ${error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  //温度による洋服画像を選択
  const clothesImage = (id, temperature) => {
    if (id <= 700) {
      for (let i = 0; i < TEMPERATURE_RAINCLOTHES_MAP.length; i++) {
        const { min, image } = TEMPERATURE_CLOTHES_MAP[i];
        if (!min || temperature >= min) {
          return image;
        }
      }
    }
    for (let i = 0; i < TEMPERATURE_CLOTHES_MAP.length; i++) {
      const { min, image } = TEMPERATURE_CLOTHES_MAP[i];
      if (!min || temperature >= min) {
        return image;
      }
    }
  };

  //日にちと時間を見やすいように変換
  const convertTimeToHour = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}時`;
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
            <div>
              <div className={styles.todayResultTitle}>
                <p>
                  {todayDaytime.month} 月{todayDaytime.day} 日
                  {todayDaytime.weekday} 　{todayDaytime.period}
                  {todayDaytime.hour} 時　
                  {weather.name}　の天気
                </p>
              </div>
              <div className={styles.todayResultWether}>
                <div>
                  <img
                    className={styles.todayResultWetherIcon}
                    src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
                    alt="Weather icon"
                  />
                </div>
                <span className={styles.todayResultWetherCelsius}>
                  {weather.main.feels_like}°C
                </span>
              </div>
              <div className={styles.todayResultWether}>
                <img
                  className={styles.todayResultCloth}
                  src={clothesImage(
                    weather.weather.id,
                    weather.main.feels_like
                  )}
                  alt="Appropriate clothes"
                />
              </div>

              <h4>24h Forecast:</h4>
              <div className={styles.todayResultInOneDas}>
                {forecast.map((info, index) => (
                  <div key={index} className={styles.todayResultInOneDay}>
                    <span>{convertTimeToHour(info.time)}</span>
                    <span>
                      {info.weather} {info.tempCelsius} ℃
                    </span>
                    <img
                      className={styles.todayResultClothInOneDay}
                      src={clothesImage(
                        weather.weather.id,
                        weather.main.feels_like
                      )}
                      alt="Appropriate clothes"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
