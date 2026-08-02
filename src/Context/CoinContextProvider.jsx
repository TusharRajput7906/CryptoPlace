import React, { useEffect, useState, useCallback } from "react";
import { CoinContext } from "./CoinContext";
import { cachedFetch } from "./api";

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]);
  const [currency, setCurrency] = useState({
    name: "usd",
    symbol: "$"
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchCoins = useCallback(async (pageNum, currentCurrency, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cachedFetch("coins/markets", {
        vs_currency: currentCurrency.name,
        order: "market_cap_desc",
        per_page: "20",
        page: pageNum.toString(),
        sparkline: "false"
      });

      if (data && data.length > 0) {
        setAllCoin((prev) => (append ? [...prev, ...data] : data));
        if (data.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        if (!append) {
          setAllCoin([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      if (err.message === "RATE_LIMIT") {
        setError("CoinGecko API rate limit exceeded (429). Please wait a minute and try again.");
      } else {
        setError("Failed to fetch cryptocurrency data. Please check your network connection.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // When currency changes, fetch page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoins(1, currency, false);
    }, 0);
    return () => clearTimeout(timer);
  }, [currency, fetchCoins]);

  // Synchronously reset page and update currency to avoid state updates inside effects
  const changeCurrency = useCallback((newCurrency) => {
    setCurrency(newCurrency);
    setPage(1);
  }, []);

  // Load more coins
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCoins(nextPage, currency, true);
    }
  }, [page, currency, loading, hasMore, fetchCoins]);

  const contextValue = {
    allCoin,
    currency,
    setCurrency: changeCurrency,
    loading,
    error,
    hasMore,
    loadMore
  };

  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  );
};

export default CoinContextProvider;
