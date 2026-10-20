"use client";

import { createContext, useContext, useState } from "react";

// The free-text box filters the current results page in the browser only
// (same as before the RSC move), so it is shared state rather than a URL param.
const SearchQueryContext = createContext<{ query: string; setQuery: (q: string) => void } | null>(null);

export function SearchQueryProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  return <SearchQueryContext.Provider value={{ query, setQuery }}>{children}</SearchQueryContext.Provider>;
}

export function useSearchQuery() {
  const ctx = useContext(SearchQueryContext);
  if (!ctx) throw new Error("useSearchQuery must be used inside SearchQueryProvider");
  return ctx;
}
