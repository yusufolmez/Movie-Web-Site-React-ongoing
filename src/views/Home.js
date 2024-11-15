
// Home.js veya ilgili bileşen
import React, { useState } from 'react';
import Slider from '../slider main page/slider';
import MovieList from "../slider main page/MovieList";

const Home = () => {
  const [selectedGenre, setSelectedGenre] = useState(null); // Seçilen kategoriyi tut

  return (
    <div>
      <Slider setSelectedGenre={setSelectedGenre} />
    </div>
  );
};

export default Home;