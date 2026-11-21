import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const PostTodos = () => {
  const [input, setInput] = useState<string>("");

  const queryClient = useQueryClient();

  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        throw new Error("Failed to post todo");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setInput("");
    },
  });

  if (isPending) return <p>loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      <input
        type="text"
        value={input}
        placeholder="Add a todo"
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={() => mutate(input)}>Add +</button>
    </div>
  );
};

export default PostTodos;
