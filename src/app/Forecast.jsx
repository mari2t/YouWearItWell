"use client";
import styles from "./styles/forecast.module.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

// API base URLs
const WEATHER_API_BASE_URL =
  "https://api.openweathermap.org/data/2.5/weather?q=";
const FORECAST_API_BASE_URL =
  "https://api.openweathermap.org/data/2.5/forecast?q=";

//服装URL
const TEMPERATURE_CLOTHES_MAP = [
  {
    min: 26,
    image: "/img/nosleeve.jpg",
    imageRain: "/img/nosleeveWithUmbrella.jpg",
    textCloth: "ノースリーブががおすすめです。",
    textAdd: "熱中症に気を付けて。",
  },
  {
    min: 22,
    image: "/img/shortsleeve.jpg",
    imageRain: "/img/shortsleeveWithUmbrella.jpg",
    textCloth: "半袖がおすすめです。",
    textAdd: "少し暑いかもしれません。",
  },
  {
    min: 17,
    image: "/img/longsleeve.jpg",
    imageRain: "/img/longsleeveWithUmbrella.jpg",
    textCloth: "長袖がおすすめです。",
    textAdd: "少し寒いかもしれません。",
  },
  {
    min: 12,
    image: "/img/sweater.jpg",
    imageRain: "/img/sweaterWithUmbrella.jpg",
    textCloth: "セーターがおすすめです。",
    textAdd: "寒いかもしれません。",
  },
  {
    min: 6,
    image: "/img/coat.jpg",
    imageRain: "/img/coatWithUmbrella.jpg",
    textCloth: "コートがおすすめです",
    textAdd: "寒いようです。",
  },
  {
    min: null,
    image: "/img/glovesAndKnitHat.jpg",
    imageRain: "/img/glovesAndKnitHatWithUmbrella.jpg",
    textCloth: "厚手のコートがおすすめです。",
    textAdd: "とても寒いようです。",
  },
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

  //お天気情報取得
  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const encodedCity = encodeURIComponent(city);

      //今日のデータを取得
      const response = await axios.get(`/api/weather`, {
        params: {
          encodedCity: encodedCity,
        },
      });

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
          description: response.data.weather[0].description,
        },
      });

      //5日間３時間ごとのデータを取得
      const responseFiveDays = await axios.get(`/api/forecast`, {
        params: {
          encodedCity: encodedCity,
        },
      });

      //直近16個のデータを格納
      const newForecast = responseFiveDays.data.list.slice(3, 11).map((el) => ({
        id: el.weather[0].id,
        time: el.dt_txt,
        weather: el.weather[0].description,
        tempCelsius: kelvinToCelsius(el.main.temp),
      }));

      setForecast(newForecast);
    } catch (error) {
      setError(
        `お天気情報を取得できませんでした。Browser could not retrieve weather information.`
      );
      console.log("error.toString():", error.toString());
    } finally {
      setLoading(false);
    }
  };

  //温度による洋服画像を選択
  const getClothesImageUrlByWeather = (id, temperature) => {
    //雨でない場合の定数：700より小さいと雨かそれに類似した天気
    const RAIN = 700;

    //雨かそうでないかで分岐
    if (id <= 700) {
      for (let i = 0; i < TEMPERATURE_CLOTHES_MAP.length; i++) {
        const { min, imageRain } = TEMPERATURE_CLOTHES_MAP[i];
        if (!min || temperature >= min) {
          return imageRain;
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

  //温度によるテキストを選択
  const getClothesTextUrlByWeather = (id, temperature) => {
    //雨でない場合の定数：700より小さいと雨かそれに類似した天気
    const RAIN = 700;

    //追加用のテキスト変数
    let resultText = "";

    //雨かそうでないかで分岐
    if (id <= RAIN) {
      for (let i = 0; i < TEMPERATURE_CLOTHES_MAP.length; i++) {
        const { min, textCloth } = TEMPERATURE_CLOTHES_MAP[i];
        if (!min || temperature >= min) {
          resultText = `${textCloth}傘を忘れずに。`;
          return resultText;
        }
      }
    }
    for (let i = 0; i < TEMPERATURE_CLOTHES_MAP.length; i++) {
      const { min, textCloth, textAdd } = TEMPERATURE_CLOTHES_MAP[i];
      if (!min || temperature >= min) {
        resultText = `${textCloth}${textAdd}`;
        return resultText;
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
          <p className={styles.resultLoadingAndError}>Loading...</p>
        ) : error ? (
          <p className={styles.resultLoadingAndError}>{error}</p>
        ) : (
          weather && (
            <div className={styles.resultTodayAndForecast}>
              <div className={styles.resultTodayAndForecastHalf}>
                <div className={styles.todayResultTitle}>
                  <h3>
                    {todayDaytime.month} 月{todayDaytime.day} 日
                    {todayDaytime.weekday} 　{todayDaytime.period}
                    {todayDaytime.hour} 時　
                    {weather.name}　の天気
                  </h3>
                </div>
                <div className={styles.todayResultWether}>
                  <div>
                    <p className={styles.todayResultWetherCelsius}>
                      {weather.weather.description} {weather.main.feels_like}°C
                    </p>
                  </div>
                  <div>
                    <span>
                      {getClothesTextUrlByWeather(
                        weather.weather.id,
                        weather.main.feels_like
                      )}
                    </span>
                  </div>
                </div>
                <div className={styles.todayResultWetherCloth}>
                  <img
                    className={styles.todayResultCloth}
                    src={getClothesImageUrlByWeather(
                      weather.weather.id,
                      weather.main.feels_like
                    )}
                    alt="Appropriate clothes"
                  />
                </div>
                <div></div>
              </div>
              <div className={styles.resultTodayAndForecastHalf}>
                <h3 className={styles.resultTitle}>これから24時間の天気</h3>
                <div className={styles.todayResultInOneDay}>
                  <div className={styles.todayResultInOneDayFourContents}>
                    {forecast.slice(0, 9).map((info, index) => (
                      <div key={index} className={styles.todayResultInOneDay}>
                        <span>{convertTimeToHour(info.time)}</span>
                        <span>
                          {info.weather} {info.tempCelsius} ℃
                        </span>
                        <img
                          className={styles.todayResultClothInOneDay}
                          src={getClothesImageUrlByWeather(
                            info.id,
                            info.tempCelsius
                          )}
                          alt="Appropriate clothes"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
