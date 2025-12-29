import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex pt-32 justify-center px-4">
      <div className="w-full max-w-xs">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}

