import React, { useState } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import { FaMinus } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa';
import './RegistrationForm.css';
import weddingsIcon from '../images/weddingsIcon.png';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import waze from "../images/waze.png";
import { FaMapMarkedAlt } from "react-icons/fa";
import { FaBus } from "react-icons/fa";



const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    phoneNumber: '',
    lastName: '',
    arriving: 'כן',
    guestsAmount: 1,
    notes: '',
  });

  



  const openMap = () => {
    Swal.fire({
      title: "מפה",
      html: `
        <div>
          <div className="waze-navigation">
            <a href="https://www.waze.com/ul?ll=32.821005842991134, 34.97293747356282&navigate=yes&zoom=17" target="_blank">
              <img src=${waze} alt="Waze" />
              <span>נווט עם וייז</span>
              
            </a>
          </div>
          <iframe
            width="600"
            height="400"
            src="https://maps.google.com/maps?q=32.820954,34.973431&z=18&output=embed"
          ></iframe>
          
        </div>
      `,
      width: 700,
      padding: "1em",
      showConfirmButton: false,
      showCloseButton: true
    });
  };
  
  const bus = () => {
    Swal.fire({
      title: "הסעה מאילת",
      html: `
        <div>
          <h3>לכל האילתים האהובים שלנו</h3>
          <p>אוטובוס יחכה לכם בתחנה המרכזית של אילת בשביל להביא אותכם לחגוג איתנו את היום המרגש בחיינו! האוטובוס יצא בשעה 14:30 ויחזיר אתכם מחיפה בשעה 00:00</p>
          <h5>תחנה מרכזית אילת-אגד שד' התמרים 12, אילת📍</h5>
          
        </div>
      `,
    });
  };

  // navigate to thank you page
  const navigate = useNavigate();

  const Navigation = () => {
    navigate('/wedding/thankyouPage');
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit =  (e) => {
    localStorage.setItem('firstName', formData.firstName);


    e.preventDefault();
    try {
      console.log('Sending a request to the server');
      const response =  axios.post('http://localhost:3000/api/register', {
        firstName: formData.firstName,
        phoneNumber: formData.phoneNumber,
        lastName: formData.lastName,
        arriving: formData.arriving,
        guestsAmount: formData.guestsAmount,
        notes: formData.notes,
      });
      console.log('Registration successful:', response.data);
      // transfer to thank you page if arriving value is 'כן' using Navigation function
      if (formData.arriving === 'כן') {
        Navigation();
      }
      
      else {
        Swal.fire({
          html: `<h1>תודה רבה ${formData.firstName}</h1>
          <br/>
          <h2>כמה חבל שאתם לא מגיעים
          אבל זכרו שתמיד תוכלו לגשת שוב להזמנה ולעדכן הגעה</h2>`,
          icon: 'success',
          confirmButtonText: 'אישור',
        });
      } 
      
      // Reset form fields
      setFormData({
        firstName: '',
        phoneNumber: '',
        lastName: '',
        arriving: 'כן',
        guestsAmount: 1,
        notes: '',
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <>
      <div className="invitation" >
      </div>


      <div className="rings">
        <img src={weddingsIcon} className="App-logo" alt="Weddings Icon" />
      </div>
      <form className="Form">
        <div className="segment">
          <h1 className="mainHeader">אישור הגעה</h1>
          <h2>נשמח לראותכם בין אורחינו</h2>
        </div>
        <br />
        <section className="formSection">
          <label className="firstName">
            <input
              className="firstName"
              placeholder="שם פרטי"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label className="lastName">
            <input
              className="lastName"
              placeholder="שם משפחה"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label>
          <br />
        </section>
        <label className="phoneNumber">
          <input
            placeholder="מספר נייד"
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          מגיעים לאירוע?
          <select
          className='unit'
            name="arriving"
            value={formData.arriving}
            onChange={handleChange}
          >
            <option value="כן">כן</option>
            <option value="לא">לא</option>
          </select>
        </label>
        <br />
        <div className="guestsAmount">
          <label htmlFor="guestsAmount">כמה אתם?</label>
          <div className="guestsControls">
            <button
              className="unit"
              type="button"
              onClick={() =>
                setFormData((prevData) => ({
                  ...prevData,
                  guestsAmount: parseInt(prevData.guestsAmount) + 1,
                }))
              }
            >
              <FaPlus />
            </button>
            <input
              id="guestsAmount"
              name="guestsAmount"
              value={formData.guestsAmount}
              onChange={handleChange}
              required
            />
            <button
              className="unit"
              type="button"
              onClick={() =>
                setFormData((prevData) => ({
                  ...prevData,
                  guestsAmount: Math.max(parseInt(prevData.guestsAmount) - 1, 1),
                }))
              }
            >
              <FaMinus />
            </button>
          </div>
        </div>
        <br />
        <label>
          הערות:
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </label>
        <br />
        <br />

        <button onClick={handleSubmit} className='red' id="submitBtn" type="button">
          <FaCheck /> שלח
        </button>
      </form>
      <div>
      <div className="moreInfo">
        <h1>מידע נוסף</h1>
        <button onClick={openMap} className='red' id="submitBtn" type="button">
          <FaMapMarkedAlt />
          מפת הגעה
        </button>
        <button onClick={bus} className='red' id="submitBtn" type="button">
          <FaBus />
          הסעה מאילת
        </button>
        
      </div>
    </div>
    </>
  );
};



export default RegistrationForm;


