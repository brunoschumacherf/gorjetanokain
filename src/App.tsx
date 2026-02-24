import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SorteioProvider } from './contexts/SorteioContext';
import { Publica } from './pages/Publica';
import { Admin } from './pages/Admin';
import './App.css';

function App() {
  return (
    <SorteioProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Publica />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SorteioProvider>
  );
}

export default App;
