import { BrowserRouter } from "react-router-dom";
import { UserContextProvider } from "./contexts/userContext";
import { Router } from "./routes";

import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <UserContextProvider>
        <Router />
      </UserContextProvider>
    </BrowserRouter>
  );
}

export default App;
