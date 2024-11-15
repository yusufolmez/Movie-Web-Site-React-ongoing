import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import PopularMovies from "./views/PopularMovies";
import Slider from "./slider main page/slider";
import MovieDetail from "./views/MovieDetail";
import ExternalApi from "./views/ExternalApi";
import FilmOnerileri from "./views/FilmOnerileri/FilmOnerileri";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
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
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container fluid className="flex-grow-1 mt-1">
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/external-api" component={ExternalApi} />
            <Route path="/Popular-movies" component={PopularMovies} />
            <Route path="/FilmOnerileri" component={FilmOnerileri} />
            <Route path="/movie/:title" component={MovieDetail} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
    </ThemeProvider>
  );
};

export default App;
