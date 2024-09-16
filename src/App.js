import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating"
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = 'a6186651'

export default function App() {

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null)
  // const [watched, setWatched] = useState([]);
  const {movies,isLoading,error}=useMovies(query)

  const [watched,setWatched]=useLocalStorageState([],"watched")

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (id === selectedId) ? null : id)
  }

  function handleCloseMovie() {
    setSelectedId(null)
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie])

    // localStorage.setItem('watched',JSON.stringify([...watched,movie]))
  }

  function handleDeleteWatched(id) {
    setWatched(watched => watched.filter((movie) => movie.imdbID !== id))
  }



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
          {selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} onAddWatched={handleAddWatched} watched={watched} /> :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
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
  const inputEl = useRef(null)

  useKey('Enter',function(){
    if (document.activeElement === inputEl.current) 
    return
    
    inputEl.current.focus()
    setQuery("")
  })

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
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

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState('')
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId)

  const countRef = useRef(0)

  useEffect(function () {
    countRef.current++
  }, [userRating])

  const watchedUserRating = watched.find(movie => movie.imdbID === selectedId)?.userRating

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

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: (runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current
    }
    onAddWatched(newWatchedMovie)
    onCloseMovie()

    // setAvgRating(Number(imdbRating))
    // setAvgRating((avgRating)=>(avgRating+userRating)/2)
  }

  /*eslint-disable */
  // if(imdbRating>8)
  // {
  //   [isTop,setIsTop]=useState(true)
  // }

  //   const [isTop,setIsTop]=useState(imdbRating>8)
  //   console.log(isTop)
  //   useEffect(function(){
  // setIsTop(imdbRating)
  //   },[imdbRating])

  // const isTop=imdbRating>8
  // console.log(isTop)

  const [avgRating, setAvgRating] = useState(0)

  useKey('Escape',onCloseMovie)

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
          </div>
        </header>
        {!isWatched ?
          <>
            <StarRating onSetRating={setUserRating} />

            {userRating > 0 && <button className="btn-add" onClick={handleAdd}>Add to List</button>}{""}
          </>
          : <p>you have rated this movie already {watchedUserRating}</p>
        }
      </>
    }

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

function WatchedMoviesList({ watched, onDeleteWatched }) {

  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
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

        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>-</button>
      </div>
    </li>
  )
}