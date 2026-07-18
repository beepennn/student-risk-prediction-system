import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card>
        <div className="w-96">
          <h1 className="mb-2 text-center text-3xl font-bold text-blue-600">
            Student Risk Prediction System
          </h1>

          <p className="mb-6 text-center text-gray-500">
            Sign in to continue
          </p>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
            />

            <Input
              type="password"
              placeholder="Enter your password"
            />

            <div className="text-right">
              <button className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button className="w-full">
              Login
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;