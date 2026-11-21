import { serve } from "bun";
import index from "./index.html";

export type Todos = {
  id: number;
  title: string;
};
const todos: Todos[] = [
  { id: 1, title: "go to gym" },
  { id: 2, title: "study slot 1" },
  { id: 3, title: "drink water" },
];
const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/todos": {
      GET() {
        return Response.json(todos);
      },
      async POST(req) {
        const { title } = await req.json();
        const newTodo = { id: todos.length + 1, title: title };
        todos.push(newTodo);
        return Response.json(newTodo, { status: 201 });
      },
    },

    "/api/todos/:id": {
      GET(req) {
        const id = req.params.id;
        const todo = todos.find((todo) => todo.id === parseInt(id));
        return Response.json(todo);
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
