
import { useEffect, useState } from "react";

// what is autoFetch?
const useFetch = <T>(fetchFunction_a: () => Promise<T>, autoFetch = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // calls the 3 functions above
  const fetchData = async () => {
    // setLoading true temporarily, set error to null, set data to something 
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction_a();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, []);

  // alias for fetchData() 
  return { data, loading, error, refetch: fetchData, reset };
};

export default useFetch;
