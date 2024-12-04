import React from "react";
import { Routes, Route } from "react-router-dom";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Test from "./components/test";
import Home from "./views/Home";
import Profile from "./views/Profile/Profile";
import MovieDetail from "./views/MovieDetail";
import FilmOnerileri from "./views/FilmOnerileri/FilmOnerileri";
import PicksForU from "./views/picks_for_you/index";
import { useAuth0 } from "@auth0/auth0-react";
import { ThemeProvider } from './context/ThemeContext';

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ThemeProvider>
  <div id="app" className="d-flex flex-column h-100">
    <NavBar />
    <div className="container-fluid flex-grow-1 mt-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/FilmOnerileri" element={<FilmOnerileri />} />
        <Route path="/movie/:title" element={<MovieDetail />} />
        <Route path="/PicksForUser" element={<PicksForU />} />
      </Routes>
    </div>
    <Footer />
  </div>
</ThemeProvider>
  );
};

export default App;
