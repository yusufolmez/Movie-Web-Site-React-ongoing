import React from "react";
import { Routes, Route } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Test from "./components/test";
import Home from "./views/Home";
import Profile from "./views/Profile";
import PopularMovies from "./views/PopularMovies";
import MovieDetail from "./views/MovieDetail";
import ExternalApi from "./views/ExternalApi";
import FilmOnerileri from "./views/FilmOnerileri/FilmOnerileri";
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
        <Container fluid className="flex-grow-1 mt-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/external-api" element={<ExternalApi />} />
            <Route path="/Popular-movies" element={<PopularMovies />} />
            <Route path="/FilmOnerileri" element={<FilmOnerileri />} />
            <Route path="/movie/:title" element={<MovieDetail />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
