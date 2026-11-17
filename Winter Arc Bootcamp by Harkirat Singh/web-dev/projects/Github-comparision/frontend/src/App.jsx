import { Route, Routes } from "react-router-dom";
import Home from "./components/Home.jsx";
const App = () => {
  return (
    <>
      <Routes>
        <Route element={<Home />} path="/" />
      </Routes>
    </>
  );
};

export default App;
