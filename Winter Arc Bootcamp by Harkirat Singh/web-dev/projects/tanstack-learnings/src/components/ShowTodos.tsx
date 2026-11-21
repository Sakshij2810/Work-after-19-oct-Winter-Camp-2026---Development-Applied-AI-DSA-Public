import { useQuery } from "@tanstack/react-query";
import type { Todos } from "..";
import { Link } from "react-router";

const ShowTodos = () => {
  const {
    data: todos,
    error: todosError,
    isPending: isTodosPending,
    isError: isTodosError,
    refetch,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/todos");

      if (!res.ok) {
        throw new Error("Error while fetching todos.");
      }
      return res.json();
    },
    staleTime: 10_000,
  });

  if (isTodosPending) return <p>loading...</p>;
  if (isTodosError) return <p>Error: {todosError.message}</p>;

  return (
    <div>
      {todos.map((todo: Todos) => (
        <div key={todo.id}>
          <Link className="text-black" to={`/todos/${todo.id}`}>
            <h1>{todo.title}</h1>
          </Link>
        </div>
      ))}

      <button onClick={() => refetch()}>refetch</button>
    </div>
  );
};

export default ShowTodos;
