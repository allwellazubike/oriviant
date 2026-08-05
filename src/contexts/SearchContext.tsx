import React, { createContext, useContext, useState, useEffect } from 'react';
import { CryptoCoin, LeadTrader, AcademyArticle, GlobalSearchResult } from '../types';
import { MOCK_LEAD_TRADERS, MOCK_ACADEMY_ARTICLES } from '../mockData';
import { useTrading } from './TradingContext';
import { useOverlayRegistration } from '../utils/OverlayRegistry';

interface SearchContextType {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  query: string;
  setQuery: (q: string) => void;
  results: GlobalSearchResult;
  recentSearches: string[];
  clearRecentSearches: () => void;
  addRecentSearch: (term: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { coins } = useTrading();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>(['BTC', 'Alex Vance', 'Futures Guide', 'SOL']);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  useOverlayRegistration('search-modal', isSearchOpen, closeSearch);

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => Array.from(new Set([term, ...prev])).slice(0, 6));
  };

  const clearRecentSearches = () => setRecentSearches([]);

  const currentCoins = coins && coins.length > 0 ? coins : [];

  const filteredCoins = currentCoins.filter(
    (c) =>
      c.symbol.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTraders = MOCK_LEAD_TRADERS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
  );

  const filteredArticles = MOCK_ACADEMY_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  const results: GlobalSearchResult = {
    coins: query ? filteredCoins : currentCoins.slice(0, 4),
    traders: query ? filteredTraders : MOCK_LEAD_TRADERS.slice(0, 3),
    articles: query ? filteredArticles : MOCK_ACADEMY_ARTICLES.slice(0, 2)
  };

  return (
    <SearchContext.Provider
      value={{
        isSearchOpen,
        openSearch,
        closeSearch,
        query,
        setQuery,
        results,
        recentSearches,
        clearRecentSearches,
        addRecentSearch
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
