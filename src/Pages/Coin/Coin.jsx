import React, { useContext, useEffect, useState } from "react";
import "./Coin.css";
import { useParams } from "react-router";
import { CoinContext } from "../../Context/CoinContext";
import { cachedFetch } from "../../Context/api";
import LineChart from "../../Components/LineChart/LineChart";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState();
  const [historicalData, setHistoricalData] = useState();
  const [error, setError] = useState(null);
  const { currency } = useContext(CoinContext);

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        // Exclude unnecessary tickers, developer, community, and localization data
        const data = await cachedFetch(`coins/${coinId}`, {
          localization: "false",
          tickers: "false",
          market_data: "true",
          community_data: "false",
          developer_data: "false",
          sparkline: "false"
        });
        setCoinData(data);
      } catch (err) {
        console.error(err);
        if (err.message === "RATE_LIMIT") {
          setError(
            "CoinGecko API rate limit exceeded (429). Please wait a minute and try again."
          );
        } else {
          setError(
            "Failed to fetch coin details. Please check your network connection."
          );
        }
      }
    };

    const fetchHistoricalData = async () => {
      try {
        const data = await cachedFetch(`coins/${coinId}/market_chart`, {
          vs_currency: currency.name,
          days: "10",
          interval: "daily"
        });
        setHistoricalData(data);
      } catch (err) {
        console.error(err);
        if (err.message === "RATE_LIMIT") {
          setError(
            "CoinGecko API rate limit exceeded (429). Please wait a minute and try again."
          );
        } else {
          setError(
            "Failed to fetch historical chart data. Please check your network connection."
          );
        }
      }
    };

    fetchCoinData();
    fetchHistoricalData();
  }, [coinId, currency]);

  if (error) {
    return (
      <div className="coin-error-container">
        <p className="coin-error-msg">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (coinData && historicalData) {
    return (
      <div className="coin">
        <div className="coin-name">
          <img src={coinData.image.large} alt="" loading="lazy" />
          <p>
            <b>
              {coinData.name} ({coinData.symbol.toUpperCase()})
            </b>
          </p>
        </div>
        <div className="coin-chart">
          <LineChart historicalData={historicalData} />
        </div>

        <div className="coin-info">
          <ul>
            <li>Crypto Market Rank</li>
            <li>{coinData.market_cap_rank}</li>
          </ul>
          <ul>
            <li>Current Price</li>
            <li>
              {currency.symbol}{" "}
              {coinData.market_data.current_price[
                currency.name
              ].toLocaleString()}
            </li>
          </ul>
          <ul>
            <li>Market Cap</li>
            <li>
              {currency.symbol}{" "}
              {coinData.market_data.market_cap[currency.name].toLocaleString()}
            </li>
          </ul>
          <ul>
            <li>24 Hour High</li>
            <li>
              {currency.symbol}{" "}
              {coinData.market_data.high_24h[currency.name].toLocaleString()}
            </li>
          </ul>
          <ul>
            <li>24 Hour Low</li>
            <li>
              {currency.symbol}{" "}
              {coinData.market_data.low_24h[currency.name].toLocaleString()}
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Pulstating skeleton loaders during loading
  return (
    <div className="coin">
      <div className="coin-name">
        <div className="skeleton skeleton-avatar"></div>
        <div className="skeleton skeleton-title"></div>
      </div>
      <div className="coin-chart">
        <div className="skeleton skeleton-chart-box"></div>
      </div>
      <div className="coin-info">
        {Array.from({ length: 5 }).map((_, index) => (
          <ul key={index}>
            <li>
              <span
                className="skeleton skeleton-text-item"
                style={{ width: "150px" }}
              ></span>
            </li>
            <li>
              <span
                className="skeleton skeleton-text-item"
                style={{ width: "80px" }}
              ></span>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default Coin;
