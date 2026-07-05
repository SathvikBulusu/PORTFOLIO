import { useReducer } from "react";

/* States form a strict sequence — impossible to be "transitioning"
   AND "categories" at once, unlike loose boolean flags. */
const initial = { step: "closed", category: null };

function reducer(state, action) {
  switch (action.type) {
    case "OPEN":            return { step: "transitioning", category: null };
    case "TRANSITION_DONE": return { step: "categories",     category: null };
    case "SELECT":           return { step: "detail",         category: action.category };
    case "BACK":             return { step: "categories",     category: null };
    case "CLOSE":            return { step: "closed",         category: null };
    default:                 return state;
  }
}

/* Reusable across Work.jsx and Projects.jsx — same interaction shape,
   different content. */
export function useWorkFlow() {
  const [state, dispatch] = useReducer(reducer, initial);
  return {
    step: state.step,
    category: state.category,
    open:            () => dispatch({ type: "OPEN" }),
    transitionDone:  () => dispatch({ type: "TRANSITION_DONE" }),
    select:  (cat)   => dispatch({ type: "SELECT", category: cat }),
    back:            () => dispatch({ type: "BACK" }),
    close:           () => dispatch({ type: "CLOSE" }),
  };
}