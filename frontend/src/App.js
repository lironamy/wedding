import React from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

import RegistrationForm from './components/RegistrationForm';
import ThankYouPage from './components/ThankYouPage';
import DataPage from './components/DataPage';

function App() {
  return (
    <HashRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<DataPage />} />
          <Route path="wedding/RegistrationForm" element={<RegistrationForm />} />
          <Route path="wedding/thankyouPage" element={<ThankYouPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}



export default App;
