import axios from "axios";
import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const title = "use Popcorn";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const keyUrl = "apikey=ab418752";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [watched, setWatched] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  function handleSelecte(id) {
    setSelectedId((i) => (i === id ? null : id));
  }
  function handleClose() {
    setSelectedId(null);
  }
  function handleAddMovieWatched(movie) {
    if (!watched?.find((m) => m.imdbID === movie.imdbID)) {
      setWatched((m) => [...m, movie]);
    }
  }
  function handleDelete(id) {
    const upDateList = watched?.filter((m) => m.imdbID !== id);
    setWatched(upDateList);
  }

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

    handleClose();
    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <Navb>
        <Search query={query} setQuery={setQuery} />
        <NumResault isLoading={movies} />
      </Navb>
      <Main>
        <Box>
          <Movies>
            {isLoading && <p style={{ margin: "40%" }}>LOADING...</p>}
            {error && (
              <p
                style={{
                  margin: "20px",
                  color: "red",
                  fontWeight: "600",
                  fontSize: "16px",
                }}
              >
                ⛔{error}
              </p>
            )}
            {!isLoading && !error && (
              <Movie movies={movies} handleSelecte={handleSelecte} />
            )}
          </Movies>
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              handleAddMovieWatched={handleAddMovieWatched}
              handleClose={handleClose}
              selectedId={selectedId}
              watched={watched}
            />
          ) : (
            <>
              <Summery watched={watched} />
              <WatchedList>
                <Watched watched={watched} handleDelete={handleDelete} />
              </WatchedList>
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function MovieDetails({
  watched,
  selectedId,
  handleClose,
  handleAddMovieWatched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const isWatched = watched?.find((m) => m.imdbID === selectedId);
  useEffect(
    function () {
      if (isWatched) {
        setMovie(isWatched);
        setIsLoading(false);
      } else {
        async function getMovieById() {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=ab418752&i=${selectedId}`
          );
          const data = await res.json();
          setMovie(data);
          setIsLoading(false);
        }
        getMovieById();
      }
    },
    [selectedId]
  );
  useEffect(() => {
    if (!movie.Title) return;
    document.title = `Movie | ${movie.Title}`;

    return () => {
      document.title = title;
    };
  }, [movie.Title]);

  useEffect(() => {
    function handleEvent(e) {
      if (e.code === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleEvent);
    return () => {
      document.removeEventListener("keydown", handleEvent);
    };
  }, [handleClose]);

  function handleAdd() {
    handleAddMovieWatched({ ...movie, userRating });
    handleClose();
  }
  return (
    <>
      {isLoading ? (
        <h3 style={{ margin: "40%" }}>Loading...</h3>
      ) : (
        <>
          <header style={{ display: "flex" }}>
            <CloseDetaile handleClose={handleClose} />
            <img
              style={{ width: "auto", height: "200px" }}
              src={movie.Poster}
              alt={`poster from ${movie.Title}`}
            />
            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>

              <p>{movie.Genre}</p>
              <p style={{ fontSize: "12px" }}>
                <span>⭐</span>
                {movie.imdbRating} Imdb Rating
              </p>
            </div>
          </header>
          <section style={{ padding: "10px", fontSize: "14px" }}>
            <div className="rating">
              {!isWatched?.userRating ? (
                <>
                  <StarRating maxLength={10} setMovieRating={setUserRating} />
                  <button className="btn-add" onClick={handleAdd}>
                    Add to watched
                  </button>
                </>
              ) : (
                <p>
                  you already reated to this movie! ⭐ {isWatched?.userRating}
                </p>
              )}
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p style={{ margin: "10px" }}>Starring : {movie.Actors}</p>
            <p style={{ margin: "10px" }}>Directed by : {movie.Director} </p>
          </section>
        </>
      )}
    </>
  );
}
function CloseDetaile({ handleClose }) {
  return (
    <button className="btn-back" onClick={handleClose}>
      &larr;
    </button>
  );
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <CloseOpenBtn setIsOpen={setIsOpen} isOpen={isOpen} />
      {isOpen && children}
    </div>
  );
}

function Movies({ children }) {
  return <ul className="list list-movies">{children}</ul>;
}

function WatchedList({ children }) {
  return <ul className="list">{children}</ul>;
}

function Watched({ watched, handleDelete }) {
  return (
    <>
      {watched?.map((movie) => (
        <li key={movie.imdbID}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>⭐️</span>
              <span>{movie.imdbRating}</span>
            </p>
            <p>
              <span>🌟</span>
              <span>{movie.userRating}</span>
            </p>
            <p>
              <span>⏳</span>
              <span>{movie.Runtime}</span>
            </p>
          </div>
          <button
            className="btn-delete"
            onClick={() => handleDelete(movie.imdbID)}
          >
            X
          </button>
        </li>
      ))}
    </>
  );
}

function Summery({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(
    watched.map((movie) => Number(movie.Runtime.split(" ").at(0)))
  );

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating ? avgUserRating.toFixed(2) : 0}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}

function Movie({ movies, handleSelecte }) {
  return (
    <>
      {movies?.map((movie) => (
        <li key={movie.imdbID} onClick={() => handleSelecte(movie.imdbID)}>
          <img src={movie.Poster} alt={`${movie.Title} poster`} />
          <h3>{movie.Title}</h3>
          <div>
            <p>
              <span>🗓</span>
              <span>{movie.Year}</span>
            </p>
          </div>
        </li>
      ))}
    </>
  );
}

function Navb({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function NumResault({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function CloseOpenBtn({ setIsOpen, isOpen }) {
  return (
    <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
      {isOpen ? "–" : "+"}
    </button>
  );
}
