import React, { useContext, useMemo, useState, useEffect } from "react";
import "./Home.css";
import { CoinContext } from "../../Context/CoinContext";
import { Link } from "react-router";

const Home = () => {
  const { allCoin, currency, loading, error, hasMore, loadMore } =
    useContext(CoinContext);
  const [input, setInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  // Debounce the search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setSubmittedSearch(input);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [input]);

  const inputHandler = (event) => {
    setInput(event.target.value);
  };

  const searchHandler = (event) => {
    event.preventDefault();
    setSubmittedSearch(input);
  };

  const displayCoin = useMemo(() => {
    if (!submittedSearch) {
      return allCoin;
    }
    return allCoin.filter((item) => {
      return item.name.toLowerCase().includes(submittedSearch.toLowerCase());
    });
  }, [allCoin, submittedSearch]);

  return (
    <div className="home">
      <div className="hero">
        <h1>
          Largest <br /> Crypto MarketPlace
        </h1>
        <p>
          Welcome to the world's largest cryptocurrency marketplace. Sign up to
          explore more about cryptos.
        </p>
        <form onSubmit={searchHandler}>
          <input
            onChange={inputHandler}
            list="coinlist"
            value={input}
            type="text"
            placeholder="Search crypto.."
            required
          />

          <datalist id="coinlist">
            {allCoin.map((item, index) => (
              <option key={index} value={item.name} />
            ))}
          </datalist>

          <button type="submit">Search</button>
        </form>
      </div>

      {error && (
        <div className="home-error-container">
          <p>{error}</p>
        </div>
      )}

      <div className="crypto-table">
        <div className="table-layout">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style={{ textAlign: "center" }}>24H Change</p>
          <p className="market-cap">Market Cap</p>
        </div>

        {loading && allCoin.length === 0 ? (
          Array.from({ length: 10 }).map((_, index) => (
            <div className="table-layout" key={index}>
              <p>
                <span
                  className="skeleton skeleton-row-box"
                  style={{ width: "20px", height: "15px" }}
                ></span>
              </p>
              <div>
                <span className="skeleton skeleton-img"></span>
                <span
                  className="skeleton skeleton-row-box"
                  style={{ width: "120px", height: "15px" }}
                ></span>
              </div>
              <p>
                <span
                  className="skeleton skeleton-row-box"
                  style={{ width: "80px", height: "15px" }}
                ></span>
              </p>
              <p style={{ textAlign: "center" }}>
                <span
                  className="skeleton skeleton-row-box"
                  style={{ width: "60px", height: "15px" }}
                ></span>
              </p>
              <p className="market-cap">
                <span
                  className="skeleton skeleton-row-box"
                  style={{ width: "100px", height: "15px" }}
                ></span>
              </p>
            </div>
          ))
        ) : (
          displayCoin.map((item, index) => (
            <Link to={`/coin/${item.id}`} className="table-layout" key={index}>
              <p>{item.market_cap_rank}</p>
              <div>
                <img src={item.image} alt="" loading="lazy" />
                <p>{item.name + " - " + item.symbol}</p>
              </div>
              <p>
                {currency.symbol} {item.current_price.toLocaleString()}
              </p>
              <p
                className={
                  item.price_change_percentage_24h > 0 ? "green" : "red"
                }
              >
                {Math.floor(item.price_change_percentage_24h * 100) / 100}
              </p>
              <p className="market-cap">
                {currency.symbol}
                {item.market_cap.toLocaleString()}
              </p>
            </Link>
          ))
        )}
      </div>

      {!submittedSearch && allCoin.length > 0 && hasMore && (
        <div className="load-more-container">
          <button
            onClick={loadMore}
            disabled={loading}
            className="load-more-btn"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
