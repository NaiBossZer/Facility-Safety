import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { AppDataProvider } from "./store/AppDataProvider";
import { Dashboard } from "./pages/Dashboard"; // สมมติว่าสร้างไฟล์หน้าเพจไว้แล้ว
import { Reports } from "./pages/Reports";

export default function App() {
  return (
    <AppDataProvider>
      <Router>
        <Header />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </Router>
    </AppDataProvider>
  );
}