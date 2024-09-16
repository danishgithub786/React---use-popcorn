import { useState,useEffect } from "react";
const KEY = 'a6186651'

export function useMovies(query)
{
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

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
    
        // handleCloseMovie()
        fetchMovies()
    
        return function () {
          controller.abort()  //in every new keystroke the controller will abort current fetch request
        }
      }, [query])
      return{movies,isLoading,error}
}