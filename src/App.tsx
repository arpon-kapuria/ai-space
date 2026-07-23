import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { GraphExplorer } from "./pages/GraphExplorer";
import { DetailedNote } from "./pages/DetailedNote";
import { About } from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<GraphExplorer />} />
          <Route path="/explore/:category" element={<GraphExplorer />} />
          <Route path="/topic/:slug" element={<DetailedNote />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
