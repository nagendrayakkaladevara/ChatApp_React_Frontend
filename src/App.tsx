import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import './App.css'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import LandingPage from "./pages/LandinPage";
import SignUpPage from "./pages/SignUpPage";
import Chat from "./components/Chat";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
