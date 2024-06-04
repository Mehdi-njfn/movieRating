import { useEffect, useState } from "react";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setError("");
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=ab418752&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok)
          throw new Error("something went wrong with fetching movie");

        const data = await res.json();

        if (data.Response === "False") throw new Error("movie not found");

        setMovies(data.Search);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (!query.length) {
      setMovies([]);
      setError("enter name of movie");
      return;
    }

    // handleClose();
    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query]);

  return { movies, isLoading, error };
}
