import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex pt-32 justify-center px-4">
      <div className="w-full max-w-xs">
        <h1 className="text-3xl font-bold text-center mb-8">Sign Up</h1>
        <SignupForm />
      </div>
    </div>
  );
}

