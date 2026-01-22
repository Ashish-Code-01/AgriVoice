import React from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import Dashboard from "./pages/Dashboard";
import SignInPage from "./pages/SignInPage";
import { Home } from "./pages/Home";

const App: React.FC = () => {
  return (
    <BrowserRouter>
    
      <Routes>
        {/* root redirect */}
        <Route
          path="/"
          element={
            <Home/>
          }
        />

        <Route path="/sign-in/*" element={<SignInPage />} />

        {/* dashboard protected */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        {/* catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
