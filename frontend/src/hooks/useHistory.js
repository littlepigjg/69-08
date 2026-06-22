import { useState, useCallback, useRef, useEffect } from 'react'

export function useHistory(initialState, options = {}) {
  const { maxHistory = 50 } = options
  const [state, setState] = useState(initialState)
  const pastRef = useRef([])
  const futureRef = useRef([])
  const batchRef = useRef(false)
  const batchSnapshotRef = useRef(null)

  const canUndo = pastRef.current.length > 0
  const canRedo = futureRef.current.length > 0

  const set = useCallback((newState, { skipHistory = false } = {}) => {
    if (skipHistory) {
      setState(newState)
      return
    }

    if (batchRef.current) {
      setState(newState)
      return
    }

    setState(prevState => {
      pastRef.current.push(prevState)
      if (pastRef.current.length > maxHistory) {
        pastRef.current.shift()
      }
      futureRef.current = []
      return typeof newState === 'function' ? newState(prevState) : newState
    })
  }, [maxHistory])

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return

    const prev = pastRef.current.pop()
    setState(current => {
      futureRef.current.unshift(current)
      return prev
    })
  }, [])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return

    const next = futureRef.current.shift()
    setState(current => {
      pastRef.current.push(current)
      return next
    })
  }, [])

  const beginBatch = useCallback(() => {
    if (batchRef.current) return
    batchRef.current = true
    batchSnapshotRef.current = state
  }, [state])

  const endBatch = useCallback(() => {
    if (!batchRef.current) return
    batchRef.current = false
    
    if (batchSnapshotRef.current !== null) {
      setState(current => {
        pastRef.current.push(batchSnapshotRef.current)
        if (pastRef.current.length > maxHistory) {
          pastRef.current.shift()
        }
        futureRef.current = []
        return current
      })
    }
    batchSnapshotRef.current = null
  }, [maxHistory])

  const reset = useCallback((newState) => {
    setState(newState)
    pastRef.current = []
    futureRef.current = []
    batchRef.current = false
    batchSnapshotRef.current = null
  }, [])

  useEffect(() => {
    if (initialState !== undefined && pastRef.current.length === 0 && futureRef.current.length === 0) {
      setState(initialState)
    }
  }, [])

  return {
    state,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    beginBatch,
    endBatch,
    reset
  }
}

export default useHistory
