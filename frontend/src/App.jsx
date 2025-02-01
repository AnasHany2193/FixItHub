import { Routes, Route } from "react-router";

function App() {
  return (
    <main className="flex min-h-screen">
      <Routes>
        <Route index path="/" element={<div>Home Page</div>} />
        <Route index path="/about" element={<div>About Page</div>} />
      </Routes>
    </main>
  );
}

export default App;
