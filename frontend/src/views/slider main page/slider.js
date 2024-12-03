import React, { useState } from 'react';
import MovieList from './MovieList'; // MovieList bileşenini içe aktar
import '../../index.css';

const Slider = () => {
  const [itemActive, setItemActive] = useState(0);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  

  const handleThumbnailClick = (genreId) => {
    setSelectedGenreId(genreId); // Seçilen türü ayarla
    setItemActive(0); // Seçim yapıldığında ilk öğeyi aktif yap
  };

  const items = [
    {
      img: process.env.PUBLIC_URL + "/assets/action.jpg",
      title: "Action",
      subtitle: "The Batman",
      description: "The Batman follows a relentless Bruce Wayne as he uncovers dark secrets and hunts a deadly killer in Gotham’s corrupt underworld.",
      genreId: 28
    },
    {
      img: process.env.PUBLIC_URL + "/assets/img2.jpg",
      title: "Porsche",
      subtitle: "cars",
      description: "Porsche is the epitome of luxury and performance, blending iconic design with precision engineering.",
      genreId: 18
    },
    {
      img: process.env.PUBLIC_URL + "/assets/img3.jpg",
      title: "Team",
      subtitle: "cars",
      description: "Cars are more than transportation; they're a symbol of freedom, innovation, and style.",
      genreId: 16
    },
    {
      img: process.env.PUBLIC_URL + "/assets/img4.jpg",
      title: "Action",
      subtitle: "cars",
      description: "Car action is adrenaline-fueled excitement, where speed meets precision.",
      genreId: 15
    },
    {
      img: process.env.PUBLIC_URL + "/assets/img5.jpg",
      title: "3 2 1 Go",
      subtitle: "cars",
      description: '"3, 2, 1, Go!" signals the start of an electrifying moment.',
      genreId: 11
    }
  ];

  // Filtrelenmiş film listesini oluştur
  const filteredItems = selectedGenreId ? items.filter(item => item.genreId === selectedGenreId) : items;


  return (
    <div>
      <div className="slider">
        <div className="list">
          {filteredItems.map((item, index) => (
            <div key={index} className={`item ${index === itemActive ? "active" : ""}`}>
              <img src={item.img} alt="slider-img" />
              <div className="content">
                <p>{item.subtitle}</p>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>


        <div className="thumbnail">
          {items.map((item, index) => (
            <div key={index} className={`slide ${item.genreId === selectedGenreId ? "active" : ""}`} onClick={() => handleThumbnailClick(item.genreId)}>
              <img src={item.img} alt="thumbnail" />
              <div className="content">{item.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MovieList bileşenini burada çağır ve seçilen türü prop olarak geç */}
      <MovieList selectedGenreId={selectedGenreId} />
    </div>
  );
};

export default Slider;
