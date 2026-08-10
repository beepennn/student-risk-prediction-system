import {
  FiLogIn,
} from "react-icons/fi";

import AuthPageShell from "../components/AuthPageShell";
import LoginForm from "../components/LoginForm";


function LoginPage() {
  return (
    <AuthPageShell
      icon={<FiLogIn size={27} />}
      title="Welcome back"
      description="Sign in using your registered account to access the Student Risk Prediction System."
    >
      <LoginForm />
    </AuthPageShell>
  );
}


export default LoginPage;