import React from 'react';
import { FaHeart } from 'react-icons/fa';
import './ThankYouPage.css';
import dancingWoman from '../images/dancingWoman.gif';
import Confetti from 'react-confetti'


const ThankYouPage = () => {
  // const renderHearts = () => {
    // const numHearts = 20;
    // const hearts = [];

    // determine the width and height of the window
    const { innerWidth: width, innerHeight: height } = window;



  //   for (let i = 0; i < numHearts; i++) {
  //     const size = Math.random() * 10 + 50;
  //     const x = Math.random() * window.innerWidth;
  //     const y = Math.random() * window.innerHeight;
  //     const animationDuration = Math.random() * 10 + 10;

  //     const heartStyle = {
  //       position: 'absolute',
  //       left: `${x}px`,
  //       top: `${y}px`,
  //       fontSize: `${size}px`,        
  //       color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
  //       animation: `float ${animationDuration}s linear infinite`,
  //       zIndex: 1,
  //     };

  //     hearts.push(<FaHeart key={i} style={heartStyle} />);
  //   }

  //   return hearts;
  // };

//   import firstName from localStorage
    const firstName = localStorage.getItem('firstName');
    console.log(firstName);

    //   after 5 seconds clear local storage
    setTimeout(() => {
        localStorage.clear();
    }
    , 5000);

  return (
    
    <div className="thank-you-page">
      <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={100}
      gravity={0.01}
      opacity={0.8}
    />
      {/* <div className="heart-container">{renderHearts()}</div> */}
        {/* <img  src={dancingWoman} className='dancingWoman' alt='dancingWoman' /> */}

      <h1 className="thank-you-text">  תודה רבה {firstName}</h1>
      <h3 className="thank-you-text-p">איזה כיף! נתראה באירוע</h3>

    </div>
  );


  
};

export default ThankYouPage;
