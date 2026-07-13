import { AuthShell } from "@/components/auth/auth-shell";
import accountLoginHero from "@/assets/images/auth/account-login-hero.png";
import portalLoginBackground from "@/assets/images/auth/portal-login-background.png";

const LoginPage = () => {
  return (
    <AuthShell
      mode="login"
      title="Login"
      subtitle="Parents and Teachers can sign in here to continue their personalized learning journeys."
      artwork={accountLoginHero}
      background={portalLoginBackground}
    />
  );
};

export default LoginPage;
