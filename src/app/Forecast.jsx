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
  const [timezoneData, setTimezoneData] = useState([]);
  const [displayCityName, setDisplayCityName] = useState([]);

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
          feels_like: parseInt(response.data.main.feels_like, 10),
        },
        weather: {
          ...response.data.weather,
          id: response.data.weather[0].id,
          description: response.data.weather[0].description,
        },
        dt: response.data.dt,
      });

      //5日間３時間ごとのデータを取得
      const responseFiveDays = await axios.get(`/api/forecast`, {
        params: {
          encodedCity: encodedCity,
        },
      });
      console.log("responseFiveDays", responseFiveDays);

      //timezone(Shift in second)を取得
      setTimezoneData(responseFiveDays.data.city.timezone);

      //直近8個のデータを格納
      const newForecast = responseFiveDays.data.list.slice(0, 8).map((el) => ({
        id: el.weather[0].id,
        time: el.dt,
        weather: el.weather[0].description,
        tempCelsius: parseInt(el.main.feels_like, 10),
      }));

      setForecast(newForecast);
      setDisplayCityName(city);
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
  const convertTimeToHour = (dateInSecond) => {
    //dateInSecond(UTC)をcityのtimezoneで補正
    const AccurateDateTime = dateInSecond + timezoneData;

    // UNIX timestamp をミリ秒に変換
    const date = new Date(AccurateDateTime * 1000);

    // ゼロを追加して2桁にするヘルパー関数
    const zeroPad = (num, places) => String(num).padStart(places, "0");

    // 日付と時間をフォーマット
    const formattedTime = `${zeroPad(date.getUTCMonth() + 1, 2)}-${zeroPad(
      date.getUTCDate(),
      2
    )} ${zeroPad(date.getUTCHours(), 2)}:${zeroPad(date.getUTCMinutes(), 2)}`;
    return formattedTime;
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
                    Current weather in {displayCityName} (
                    {convertTimeToHour(weather.dt)})
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
