import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("./components/Home"));
const BlogList = lazy(() => import("./components/BlogList"));
const BlogPost = lazy(() => import("./components/BlogPost"));
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
  const gatewayBase = window.location.pathname.match(
    /^\/(?:ipfs|ipns)\/[^/]+(?=\/|$)/,
  )?.[0];

  return (
    <BrowserRouter basename={gatewayBase}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
