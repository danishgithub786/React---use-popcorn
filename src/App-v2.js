import { useState, useEffect } from "react";
import StarRating from "./StarRating"

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

const KEY = 'a6186651'

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null)

  /*
  useEffect(function(){
    console.log('after initial render')
  },[])

  useEffect(function(){
    console.log('after every render')
  })

  useEffect(function(){
    console.log('query')
  },[query])

  console.log("C")
  */

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (id === selectedId) ? null : id)
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }


  useEffect(function () {
    const controller = new AbortController()
    async function fetchMovies() {
      try {
        setIsLoading(true)
        setError("") //reseting the error
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal })

        if (!res.ok) throw new Error("something went wrong for fetching movies")

        const data = await res.json()

        if (data.Response === 'False') {
          throw new Error("movie not found")
        }
        setMovies(data.Search)
        setError('')
      }
      catch (e) {
        // console.log(e.message)

        if (error.name !== 'AbortError') {
          setError(e.message)
        }

      }
      finally {
        setIsLoading(false)
      }
    }
    if (query.length < 3) {
      setMovies([])
      setError('')
      return
    }

    handleCloseMovie()
    fetchMovies()

    return function () {
      controller.abort()  //in every new keystroke the controller will abort current fetch request
    }
  }, [query])



  return (
    <>
      <Navbar movies={movies}>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}

          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectedMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} /> :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          }
        </Box>

      </Main>
    </>
  );
}

function Loader() {
  return (
    <p>Loading....</p>
  )
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      {message}
    </p>
  )
}

function Navbar({ children }) {
  const [query, setQuery] = useState("")
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
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
  )
}

function Main({ children }) {
  return (
    <main className="main">
      {children}
    </main>
  )
}


function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && (children)}
    </div>
  )
}

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  )
}
*/

function MovieList({ movies, onSelectMovie }) {

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movies movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  )
}

function Movies({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)} >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({ selectedId, onCloseMovie }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const { Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie
  console.log(title)


  //the below functuon will add new event listener every time when use effect is called so as to remove it we will need a cleanup function
  useEffect(function () {
    function callback(e)
    {
        if (e.code === 'ESCAPE') {
          console.log('closing')
          onCloseMovie()
        }
    }

    document.addEventListener('keydown', callback)

    //each time the component re-renders then the old event listener will be removed
    return function()
    {
      document.removeEventListener('keydown',callback)
    }
  }, [onCloseMovie])


  useEffect(function () {

    async function getMovieDetails() {
      setIsLoading(true)
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
      const data = await res.json()
      setMovie(data)
      setIsLoading(false)
    }
    getMovieDetails()
  }, [selectedId])

  useEffect(function () {
    if (!title) return
    document.title = title

    return function () {
      document.title = 'popcorn'
      console.log(`cleanup effect for movie ${title}`)
    }
  }, [title])

  return <div className="details">
    {isLoading ? <Loader /> :
      <>
        <header>
          <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
          <img src={poster} alt="Poster of movie" />
          <div className="detailsOverview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <StarRating />
          </div>
        </header>
      </>}

  </div>

}


function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMoviesList({ watched }) {

  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  )
}


function WatchedMovie({ movie }) {
  return (
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
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  )
}