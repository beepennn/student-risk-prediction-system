import Card from "../../../components/ui/Card";
import ResetPasswordForm from "../components/ResetPasswordForm";

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

          <ResetPasswordForm />
        </div>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;