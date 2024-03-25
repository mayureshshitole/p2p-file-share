import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Room from "./components/Room";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/share/:roomID", element: <Room /> },
]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <RouterProvider router={router} />
  </>
);
