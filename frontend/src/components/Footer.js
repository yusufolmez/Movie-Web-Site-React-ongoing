import React from "react";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className={`p-3 text-center ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <div className="logo" />
      <p>
        Sample project provided by <a href="https://auth0.com" className={theme === 'dark' ? 'text-light' : 'text-dark'}>Auth0</a>
      </p>
    </footer>
  );
};

export default Footer;