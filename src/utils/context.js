import { useContext as useReactContext, createContext as createReactContext } from 'react'

export const createContext = (defaultValue = {}) => {

  const context = createReactContext(defaultValue)

  const useContet = () => {
    return useReactContext(context)
  }

  return [context, useContet]
}