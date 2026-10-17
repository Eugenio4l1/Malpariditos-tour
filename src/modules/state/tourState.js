const initialState = {
  status: "idle",
  tours: [],
  page: 1,
  lastPage: 1,
  total: 0,
  error: null,
};

let state = { ...initialState };
const listeners = new Set();

export function getTourState() {
  return { ...state, tours: [...state.tours] };
}

export function subscribeToTourState(listener) {
  listeners.add(listener);
  listener(getTourState());
  return () => listeners.delete(listener);
}

export function setTourState(changes) {
  state = { ...state, ...changes };
  const snapshot = getTourState();
  listeners.forEach((listener) => listener(snapshot));
}

export function resetTourState() {
  state = { ...initialState };
  const snapshot = getTourState();
  listeners.forEach((listener) => listener(snapshot));
}
