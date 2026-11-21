import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

const SingleTodo = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    data: todo,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["singleTodo", id],
    queryFn: async () => {
      const res = await fetch(`/api/todos/${id}`);

      if (!res.ok) {
        throw new Error("Failed to fetch todo");
      }

      return res.json();
    },
    staleTime: Infinity,
  });

  if (isPending) return <p>loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{todo.title}</h1>

      <button onClick={() => navigate(`/todos/1`)}>1</button>
      <button onClick={() => navigate(`/todos/2`)}>2</button>
      <button onClick={() => navigate(`/todos/3`)}>3</button>
    </div>
  );
};

export default SingleTodo;
