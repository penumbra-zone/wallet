import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  combineReducers,
  MiddlewareAPI,
  Dispatch,
  createStore,
  PreloadedState,
  applyMiddleware,
} from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { ACTION } from './actions';
import { KEEPERWALLET_DEBUG } from './appConfig';
import { createLogger } from 'redux-logger';
import { NetworkName } from '../networks';
import { PreferencesAccount } from '../preferences';
import * as middleware from './midleware';

const reducer = combineReducers({});

export type AppState = ReturnType<typeof reducer>;

export type UiAction =
  | {
      type: typeof ACTION.UPDATE_LANGS;
      payload: Array<{ id: string; name: string }>;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_CURRENT_NETWORK;
      payload: NetworkName;
      meta?: never;
    }
  | {
      type: typeof ACTION.UPDATE_SELECTED_ACCOUNT;
      payload: Partial<PreferencesAccount>;
      meta?: never;
    };

export type UiActionOfType<T extends UiAction['type']> = Extract<
  UiAction,
  { type: T }
>;

export type UiActionPayload<T extends UiAction['type']> =
  UiActionOfType<T>['payload'];

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

export function createUiStore(preloadedState: PreloadedState<AppState>) {
  return createStore<
    AppState,
    UiAction,
    {
      dispatch: ThunkDispatch<AppState, undefined, UiAction>;
    },
    Record<never, unknown>
  >(
    reducer,
    preloadedState,
    applyMiddleware(
      thunk,
      ...Object.values(middleware),
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

export type UiStore = ReturnType<typeof createUiStore>;

export type UiThunkAction<ReturnType> = ThunkAction<
  ReturnType,
  AppState,
  undefined,
  UiAction
>;

export type UiMiddleware = (
  api: MiddlewareAPI<Dispatch, AppState>
) => (next: Dispatch<UiAction>) => (action: UiAction) => void;

export const useAppDispatch = () => useDispatch<UiStore['dispatch']>();
