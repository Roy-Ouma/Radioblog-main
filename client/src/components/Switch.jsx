import useStore from "../store";
import React from "react";

const ThemeSwitch = () => {
   const { theme, setTheme } = useStore();
   const isDarkMode = theme === "dark";

   const toggleTheme = () => {
      const newTheme = isDarkMode ? "light" : "dark";
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
   };

   return (
      <div
         className={`switch ${isDarkMode ? "dark" : "light"}`}
         onClick={toggleTheme}
         style={{
           cursor: "pointer",
           width: '2.5rem',
           height: '1.5rem',
           background: isDarkMode ? "#222" : "#eee",
           borderRadius: '1rem',
           display: "flex",
           alignItems: "center",
           padding: 2,
           transition: 'all 0.2s',
         }}
         title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
         <div
            className={`ball ${isDarkMode ? "dark" : "light"}`}
            style={{
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: "50%",
              background: isDarkMode ? "#fbbf24" : "#222",
              transform: isDarkMode ? "translateX(1.1rem)" : "translateX(0)",
              transition: "transform 0.2s, background 0.2s",
            }}
         />
      </div>
   );
};

export default ThemeSwitch;