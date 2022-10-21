import ReactDOM from 'react-dom/client';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { extension } from '../lib';
import { createAccountsStore } from './store';

startUi();

async function startUi() {
  const store = createAccountsStore({
    version: extension.runtime.getManifest().version,
  });

  const root = ReactDOM.createRoot(
    document.getElementById('app-content') as HTMLElement
  );
  root.render(
    <Provider store={store}>
      <div>Main</div>
    </Provider>
  );
}
