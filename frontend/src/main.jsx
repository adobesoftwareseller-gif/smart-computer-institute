import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SiteProvider } from './context/SiteContext.jsx';
import './index.css';
import './smart.css';
import './admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <SiteProvider>
                <App />
            </SiteProvider>
        </BrowserRouter>
    </React.StrictMode>
);
