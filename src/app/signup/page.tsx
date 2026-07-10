import { AuthShell } from "@/components/auth/auth-shell";
import signupBackground from "@/assets/images/learn/background-signup.png";
import loginSidebar from "@/assets/images/learn/login-sidebar.png";

const SignupPage = () => {
  return (
    <AuthShell
      mode="signup"
      title="Create Account"
      subtitle="Join as a Parent or Teacher and unlock interactive lessons, quests, and progress tracking."
      artwork={loginSidebar}
      background={signupBackground}
    />
  );
};

export default SignupPage;
