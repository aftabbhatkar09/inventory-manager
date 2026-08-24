import { useState, useEffect } from "react";

// Returns `value` delayed by `delay` ms, so a search box can update on
// every keystroke while the actual API call only fires once typing pauses.
const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebouncedValue;
