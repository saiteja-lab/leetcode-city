import { combineReducers, createStore } from "redux";

const initialCityState = {
  currentCity: null,
  loading: false,
  error: "",
};

const initialAuthState = {
  session: null,
  user: null,
  loading: true,
  submitting: false,
  error: "",
  message: "",
};

const initialCommunityState = {
  cities: [],
  loading: false,
  error: "",
};

const REQUEST_START = "city/requestStart";
const REQUEST_SUCCESS = "city/requestSuccess";
const CITY_SET_ERROR = "city/setError";
const CLEAR_CURRENT_CITY = "city/clear";
const SELECT_CITY = "city/select";

const AUTH_HYDRATE = "auth/hydrate";
const AUTH_REQUEST_START = "auth/requestStart";
const AUTH_REQUEST_SUCCESS = "auth/requestSuccess";
const AUTH_SET_ERROR = "auth/setError";
const AUTH_CLEAR_FEEDBACK = "auth/clearFeedback";

const COMMUNITY_LOAD_START = "community/loadStart";
const COMMUNITY_LOAD_SUCCESS = "community/loadSuccess";
const COMMUNITY_LOAD_ERROR = "community/loadError";
const COMMUNITY_SYNC_CITY = "community/syncCity";
const COMMUNITY_CLEAR = "community/clear";

export const requestStart = (username) => ({
  type: REQUEST_START,
  payload: username,
});

export const requestSuccess = (payload) => ({
  type: REQUEST_SUCCESS,
  payload,
});

export const citySetError = (message) => ({
  type: CITY_SET_ERROR,
  payload: message,
});

export const clearCurrentCity = () => ({
  type: CLEAR_CURRENT_CITY,
});

export const selectCity = (payload) => ({
  type: SELECT_CITY,
  payload,
});

export const authHydrate = (session) => ({
  type: AUTH_HYDRATE,
  payload: session,
});

export const authRequestStart = () => ({
  type: AUTH_REQUEST_START,
});

export const authRequestSuccess = (message = "") => ({
  type: AUTH_REQUEST_SUCCESS,
  payload: message,
});

export const authSetError = (message) => ({
  type: AUTH_SET_ERROR,
  payload: message,
});

export const authClearFeedback = () => ({
  type: AUTH_CLEAR_FEEDBACK,
});

export const communityLoadStart = () => ({
  type: COMMUNITY_LOAD_START,
});

export const communityLoadSuccess = (payload) => ({
  type: COMMUNITY_LOAD_SUCCESS,
  payload,
});

export const communityLoadError = (message) => ({
  type: COMMUNITY_LOAD_ERROR,
  payload: message,
});

export const syncCommunityCity = (payload) => ({
  type: COMMUNITY_SYNC_CITY,
  payload,
});

export const clearCommunity = () => ({
  type: COMMUNITY_CLEAR,
});

function cityReducer(state = initialCityState, action) {
  switch (action.type) {
    case REQUEST_START:
      return {
        ...state,
        loading: true,
        error: "",
      };
    case REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        currentCity: action.payload,
        error: "",
      };
    case CITY_SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case CLEAR_CURRENT_CITY:
      return initialCityState;
    case SELECT_CITY:
      return {
        ...state,
        currentCity: action.payload,
        error: "",
      };
    default:
      return state;
  }
}

function authReducer(state = initialAuthState, action) {
  switch (action.type) {
    case AUTH_HYDRATE:
      return {
        ...state,
        session: action.payload,
        user: action.payload?.user || null,
        loading: false,
        submitting: false,
      };
    case AUTH_REQUEST_START:
      return {
        ...state,
        submitting: true,
        error: "",
        message: "",
      };
    case AUTH_REQUEST_SUCCESS:
      return {
        ...state,
        submitting: false,
        error: "",
        message: action.payload,
      };
    case AUTH_SET_ERROR:
      return {
        ...state,
        submitting: false,
        error: action.payload,
      };
    case AUTH_CLEAR_FEEDBACK:
      return {
        ...state,
        error: "",
        message: "",
      };
    default:
      return state;
  }
}

function communityReducer(state = initialCommunityState, action) {
  switch (action.type) {
    case COMMUNITY_LOAD_START:
      return {
        ...state,
        loading: true,
        error: "",
      };
    case COMMUNITY_LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        cities: action.payload,
        error: "",
      };
    case COMMUNITY_LOAD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case COMMUNITY_SYNC_CITY: {
      const existingIndex = state.cities.findIndex((city) => city.id === action.payload.id);

      if (existingIndex === -1) {
        const nextCities = [action.payload, ...state.cities];
        nextCities.sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
        return {
          ...state,
          cities: nextCities,
        };
      }

      const nextCities = [...state.cities];
      nextCities[existingIndex] = action.payload;
      nextCities.sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));

      return {
        ...state,
        cities: nextCities,
      };
    }
    case COMMUNITY_CLEAR:
      return initialCommunityState;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  auth: authReducer,
  city: cityReducer,
  community: communityReducer,
});

export const store = createStore(rootReducer);
