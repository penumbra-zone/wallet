import {
  applyMiddleware,
  combineReducers,
  createStore,
  PreloadedState,
} from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
// import * as reducers from 'ui/reducers/updateState';
// import * as middleware from 'ui/midleware';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { UiAction } from '../ui/store';
import { KEEPERWALLET_DEBUG } from '../ui/appConfig';

const reducer = combineReducers({});

export type AccountsState = ReturnType<typeof reducer>;

export const useAccountsSelector: TypedUseSelectorHook<AccountsState> =
  useSelector;

export function createAccountsStore(
  preloadedState: PreloadedState<AccountsState>
) {
  return createStore<
    AccountsState,
    UiAction,
    {
      dispatch: ThunkDispatch<AccountsState, undefined, UiAction>;
    },
    Record<never, unknown>
  >(
    reducer,
    preloadedState,
    applyMiddleware(
      thunk,
      // ...Object.values(middleware),
      ...(KEEPERWALLET_DEBUG
        ? [
            createLogger({
              collapsed: true,
              diff: true,
            }),
          ]
        : [])
    )
  );
}

export type AccountsStore = ReturnType<typeof createAccountsStore>;

export type AccountsThunkAction<ReturnType> = ThunkAction<
  ReturnType,
  AccountsState,
  undefined,
  UiAction
>;

export const useAppDispatch = () => useDispatch<AccountsStore['dispatch']>();
