import { AuthShell } from "@/components/auth/auth-shell";
import loginBackground from "@/assets/images/learn/login-background.png";
import loginSidebar from "@/assets/images/learn/login-sidebar.png";

const LoginPage = () => {
  return (
    <AuthShell
      mode="login"
      title="Login"
      subtitle="Parents and Teachers can sign in here to continue their personalized learning journeys."
      artwork={loginSidebar}
      background={loginBackground}
    />
  );
};

export default LoginPage;
