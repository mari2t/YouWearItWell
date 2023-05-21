import React from "react";

const translations = {
  "thunderstorm with light rain": "小雨降る雷雨",
  "thunderstorm with rain": "雨の雷雨",
  "thunderstorm with heavy rain": "大雨の雷雨",
  "light thunderstorm": "小雷雨",
  thunderstorm: "雷雨",
  "heavy thunderstorm": "重い雷雨",
  "ragged thunderstorm": "ゴロゴロ雷雨",
  "thunderstorm with light drizzle": "小雨降る雷雨",
  "thunderstorm with drizzle": "霧雨雷雨",
  "thunderstorm with heavy drizzle": "激しい霧雨の雷雨",
  "light intensity drizzle": "弱い霧雨",
  drizzle: "霧雨",
  "heavy intensity drizzle": "猛烈な霧雨",
  "light intensity drizzle rain": "小雨強度の霧雨",
  "drizzle rain": "霧雨",
  "heavy intensity drizzle rain": "猛烈な霧雨",
  "shower rain and drizzle": "シャワー雨と霧雨",
  "heavy shower rain and drizzle": "大雨と霧雨",
  "shower drizzle": "シャワー霧雨",
  "light rain": "小雨",
  "moderate rain": "中雨",
  "heavy intensity rain": "強雨",
  "very heavy rain": "超大雨",
  "extreme rain": "極端な雨",
  "freezing rain": "氷雨",
  "light intensity shower rain": "小雨",
  "shower rain": "にわか雨",
  "heavy intensity shower rain": "強度の強いシャワー雨",
  "ragged shower rain": "にわか雨",
  "light snow": "小雪",
  snow: "雪",
  "heavy snow": "大雪",
  sleet: "みぞれ",
  "light shower sleet": "小雨みぞれ",
  "shower sleet": "みぞれシャワー",
  "light rain and snow": "小雨と雪",
  "rain and snow": "雨と雪",
  "light shower snow": "小雪のシャワー",
  "shower snow": "雪が降る",
  "heavy shower snow": "大雨雪",
  mist: "霧",
  smoke: "煙",
  haze: "靄（もや）",
  "sand/dust whirls": "砂塵旋風",
  fog: "霧",
  sand: "砂",
  dust: "塵",
  "volcanic ash": "火山灰",
  squalls: "スコール",
  tornado: "トルネード",
  "clear sky": "晴れ",
  "few clouds": "曇り(雲11-25%)",
  "scattered clouds": "曇り(雲25-50%)",
  "broken clouds": "曇り(雲51-84%)",
  "overcast clouds": "曇り(雲85-100%)",
};

const TranslateWeatherDescription = ({ description }) => {
  const japaneseDescription = translations[description];

  if (!japaneseDescription) {
    // 説明が翻訳マップに見つからない場合、英語の説明をそのまま表示します
    console.log("description", description);
    return <span>{description}</span>;
  }
  console.log("japaneseDescription", japaneseDescription);
  return <span>{japaneseDescription}</span>;
};

export default TranslateWeatherDescription;
