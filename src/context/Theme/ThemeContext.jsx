import { createContext, useEffect, useMemo, useState } from "react";
import { DARK, LIGHT, SYSTEM_THEME } from "../../constant/const";
import { setOrRemoveHtmlElementClass } from "../../utils/helper";

const initialState = {
  theme: DARK,
};

export const ThemeContext = createContext();

const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(initialState);

  const toggleTheme = () => {
    setTheme((prev) => {
      let changedTheme;
      if (prev?.theme === LIGHT) {
        setOrRemoveHtmlElementClass({
          className: "dark",
          isDelete: false,
        });
        changedTheme = { theme: DARK };
      } else {
        setOrRemoveHtmlElementClass({
          className: "dark",
          isDelete: true,
        });
        changedTheme = { theme: LIGHT };
      }
      localStorage?.setItem(SYSTEM_THEME, changedTheme?.theme);
      return changedTheme;
    });
  };

  useEffect(() => {
    const currentTheme = localStorage?.getItem(SYSTEM_THEME);
    if (currentTheme && (currentTheme === LIGHT || currentTheme === DARK)) {
      setTheme({
        theme: currentTheme,
      });
      if (currentTheme === LIGHT) {
        setOrRemoveHtmlElementClass({
          className: "dark",
          isDelete: true,
        });
        return;
      }
      setOrRemoveHtmlElementClass({
        className: "dark",
        isDelete: false,
      });
      return;
    }
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
