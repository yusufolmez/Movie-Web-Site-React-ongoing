
// Home.js veya ilgili bileşen
import React, { useState } from 'react';
import Slider from './slider main page/MainPage';

const Home = () => {
  const [setSelectedGenre] = useState(null); // Seçilen kategoriyi tut

  return (
    <div>
      <Slider setSelectedGenre={setSelectedGenre} />
    </div>
  );
};

export default Home;