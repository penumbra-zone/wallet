import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom';
import { BackgroundType } from '../types';

export async function initApp(background: BackgroundType) {
  const root = ReactDOM.createRoot(
    document.getElementById('app-content') as HTMLElement
  );
  root.render(
    <BrowserRouter>
      <App background={background} />
    </BrowserRouter>
  );
}
