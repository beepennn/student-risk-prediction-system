import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card>
        <div className="w-96">
          <h1 className="mb-2 text-center text-3xl font-bold text-blue-600">
            Reset Password
          </h1>

          <p className="mb-6 text-center text-gray-500">
            Enter your new password below.
          </p>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
            />

            <Input
              type="password"
              placeholder="Confirm Password"
            />

            <Button className="w-full">
              Reset Password
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;