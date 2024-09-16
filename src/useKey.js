import { useEffect } from "react";

export function useKey(key,action)
{
    
  //the below functuon will add new event listener every time when use effect is called so as to remove it we will need a cleanup function
  useEffect(function () {
    function callback(e) {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        action()
      }
    }

    document.addEventListener('keydown', callback)

    //each time the component re-renders then the old event listener will be removed
    return function () {
      document.removeEventListener('keydown', callback)
    }
  }, [action,key])

}