import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const changeMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const values = useMemo(
    () => ({
      darkMode,
      changeMode,
    }),
    [darkMode, changeMode]
  );

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export const useApp = (selector) => {
  const context = useContext(AppContext);

  return selector ? selector(context) : context;
};
