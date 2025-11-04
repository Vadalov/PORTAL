// Updated Login Page with Corporate Design
import { CorporateLoginForm } from '@/components/ui/corporate-login-form';

export default function LoginPage() {
  return <CorporateLoginForm showCorporateBranding={true} redirectTo="/genel" />;
}
