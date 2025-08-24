import { createContext, useContext, useState, ReactNode } from "react";

interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  query: "",
  setQuery: () => {},
});

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState("");

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
};
