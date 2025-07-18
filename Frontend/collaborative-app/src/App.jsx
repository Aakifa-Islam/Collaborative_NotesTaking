import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CollabEnv from './pages/collabenv';
import Registration from './pages/registration';

import { Toaster } from 'react-hot-toast';


const App = () => {
    return (
        <BrowserRouter>
            <Toaster position="top-center" reverseOrder={false} />
            <Routes>
                <Route path='/' element={<Registration />}></Route>
                <Route path='/collabenv/:id' element={<CollabEnv />} > </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App