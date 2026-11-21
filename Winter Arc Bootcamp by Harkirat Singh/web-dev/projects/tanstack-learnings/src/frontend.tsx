/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { App } from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const elem = document.getElementById("root")!;

const queryCilent = new QueryClient();
const app = (
  <StrictMode>
    <QueryClientProvider client={queryCilent}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
type HotData = { root?: Root };
((import.meta.hot.data as HotData).root ??= createRoot(elem)).render(app);
