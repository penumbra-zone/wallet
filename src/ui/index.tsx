import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

export async function initApp(background: any) {
  const root = ReactDOM.createRoot(
    document.getElementById('app-content') as HTMLElement
  );
  root.render(<App background={background} />);
}
