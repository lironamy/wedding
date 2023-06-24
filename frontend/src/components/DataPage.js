import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataPage.css'
import { useNavigate } from 'react-router-dom';


const DataPage = () => {

    // coaculate the number of guests
    const [guestsAmount, setGuestsAmount] = useState(0);
    const [arriving, setArriving] = useState('כן');

    useEffect(() => {
        const fetchData = async () => {
          const result = await axios.get('https://liron-ola.online/api/data')
          ;
          const data = result.data;
          const arrivingGuests = data.filter((item) => item.arriving === 'כן');
          const guestsAmount = arrivingGuests.reduce((acc, item) => acc + (+item.guestsAmount), 0);
          setGuestsAmount(guestsAmount);
        };
        fetchData();
      }, []);


    //   coaculate the number of guests that said no
    const [guestsAmountNo, setGuestsAmountNo] = useState(0);
    const [arrivingNo, setArrivingNo] = useState('לא');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('https://liron-ola.online/api/data')
            ;
            const data = result.data;
            const arrivingGuests = data.filter((item) => item.arriving === 'לא');
            const guestsAmountNo = arrivingGuests.reduce((acc, item) => acc + (+item.guestsAmount), 0);
            setGuestsAmountNo(guestsAmountNo);
        };
        fetchData();
        }
    , []);

    //   coaculate the number of guests that said maybe
    const [guestsAmountMaybe, setGuestsAmountMaybe] = useState(0);
    const [arrivingMaybe, setArrivingMaybe] = useState('אולי');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('https://liron-ola.online/api/data');            ;
            const data = result.data;
            const arrivingGuests = data.filter((item) => item.arriving === 'אולי');
            const guestsAmountMaybe = arrivingGuests.reduce((acc, item) => acc + (+item.guestsAmount), 0);
            setGuestsAmountMaybe(guestsAmountMaybe);
        };
        fetchData();
        }
    , []);

    const navigate = useNavigate();

    const Navigation = () => {
      navigate('/wedding/RegistrationForm');
    };
    




    const [data, setData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const result = await axios('https://liron-ola.online/api/data')
            ;
            setData(result.data);
        };
        fetchData();
        }
    , []);
    return (
      <>
        <div >
            <h1>הגעות</h1> 
            <div className="data-page">
            <h2>סה"כ מוזמנים: {data.length}</h2>
            <h2>סה"כ אישרו הגעה: {guestsAmount}</h2>
            <h2>סה"כ לא אישרו הגעה: {guestsAmountNo}</h2>
            <h2>סה"כ אולי: {guestsAmountMaybe}</h2>
            </div>


          <div className="table-container">
            <div className="table-header">
              <div className="table-data">שם פרטי</div>
              <div className="table-data">שם משפחה</div>
              <div className="table-data">נייד</div>
              <div className="table-data">מגיע</div>
              <div className="table-data">כמות מוזמנית</div>
              <div className="table-data">הערות</div>
            </div>
            {data.map((item) => (
              <div className="table-row" key={item._id}>
                <div className="table-data">{item.firstName}</div>
                <div className="table-data">{item.lastName}</div>
                <div className="table-data">{item.phoneNumber}</div>
                <div className="table-data">{item.arriving}</div>
                <div className="table-data">{parseInt(item.guestsAmount)}</div>
                <div className="table-data">{item.notes}</div>
              </div>
            ))}
          </div>
        </div>

     
        <div>

          {/* on click use Navigation  */}
          <button onClick={Navigation}>הרשמה</button>
        </div>
        </>

      );
};
  
  export default DataPage;
  