import { createContext, useState } from "react";

export const CTContext = createContext();

export const CTProvider = ({ children }) => {
  const [slices, setSlices] = useState([]);
  const [selectedSlice, setSelectedSlice] = useState(null);

  return (
    <CTContext.Provider
      value={{ slices, setSlices, selectedSlice, setSelectedSlice }}
    >
      {children}
    </CTContext.Provider>
  );
};