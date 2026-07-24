import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card>
        <div className="w-96">
          <h1 className="mb-2 text-center text-3xl font-bold text-blue-600">
            Forgot Password
          </h1>

          <p className="mb-6 text-center text-gray-500">
            Enter your email address to receive a password reset link.
          </p>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
            />

            <Button className="w-full">
              Send Reset Link
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;