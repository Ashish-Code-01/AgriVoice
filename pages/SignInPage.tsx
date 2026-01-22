import React from "react";
import { SignIn } from "@clerk/clerk-react";

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-green-50 p-4">
      <SignIn redirectUrl="/dashboard" />
    </div>
  );
};

export default SignInPage;
