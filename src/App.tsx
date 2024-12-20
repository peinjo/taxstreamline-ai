import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { AuthProvider } from "@/contexts/AuthContext";
import TeamDetails from "@/components/teams/TeamDetails";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teams/:teamId" element={<TeamDetails />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
