import { use, useDeferredValue, useState, useEffect } from 'react';

/**
 * React 19's use() hook for unwrapping promises
 * Suspends component until promise resolves
 * 
 * @example
 * function UserProfile({ userPromise }) {
 *   const user = usePromise(userPromise);
 *   return <div>{user.name}</div>;
 * }
 */
export function usePromise<T>(promise: Promise<T>): T {
  return use(promise);
}

/**
 * Hook for debounced search with useDeferredValue
 * React 19 pattern for non-blocking search
 * 
 * @example
 * const { deferredValue, isPending } = useDebounced(searchTerm);
 * // Use deferredValue for expensive operations
 * const results = useSearch(deferredValue);
 */
export function useDebounced<T>(value: T, delay: number = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const deferredValue = useDeferredValue(debouncedValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return {
    deferredValue,
    isPending: deferredValue !== value,
  };
}

/**
 * Hook for deferred value without debounce
 * React 19 pattern for rendering optimization
 * 
 * @example
 * const deferredSearch = useDeferred(searchTerm);
 * // UI updates immediately, but expensive render is deferred
 */
export function useDeferred<T>(value: T) {
  const deferredValue = useDeferredValue(value);
  
  return {
    value: deferredValue,
    isPending: deferredValue !== value,
  };
}

/**
 * React 19 pattern: Fetch data and use with Suspense
 * Creates a promise that can be used with use() hook
 * 
 * @example
 * const userResource = createResource(() => fetchUser(id));
 * 
 * function UserProfile() {
 *   const user = use(userResource);
 *   return <div>{user.name}</div>;
 * }
 */
export function createResource<T>(fetcher: () => Promise<T>) {
  let status: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  let result: T;
  let error: unknown;

  const suspender = fetcher().then(
    (data) => {
      status = 'fulfilled';
      result = data;
    },
    (err) => {
      status = 'rejected';
      error = err;
    }
  );

  return {
    read(): T {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'rejected') {
        throw error;
      }
      return result;
    },
  };
}
