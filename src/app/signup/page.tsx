import { AuthShell } from "@/components/auth/auth-shell";
import accountSignupHero from "@/assets/images/auth/account-signup-hero.png";
import portalSignupBackground from "@/assets/images/auth/portal-signup-background.png";

const SignupPage = () => {
  return (
    <AuthShell
      mode="signup"
      title="Create Account"
      subtitle="Join as a Parent or Teacher and unlock interactive lessons, quests, and progress tracking."
      artwork={accountSignupHero}
      background={portalSignupBackground}
    />
  );
};

export default SignupPage;
