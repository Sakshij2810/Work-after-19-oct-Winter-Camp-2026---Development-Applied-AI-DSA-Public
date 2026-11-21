import { BrowserRouter, Route, Routes } from "react-router";
import PostTodos from "./components/PostTodos";
import ShowTodos from "./components/ShowTodos";
import SingleTodo from "./components/SingleTodo";

export function Todos() {
  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <ShowTodos />
      <PostTodos />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/todos" element={<Todos />} />
        <Route path="/todos/:id" element={<SingleTodo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
