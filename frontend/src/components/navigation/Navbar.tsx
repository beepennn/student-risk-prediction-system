function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <h1 className="text-xl font-bold text-blue-600">
        Student Risk Prediction System
      </h1>

      <div className="flex items-center gap-4">
        <span className="font-medium">Admin</span>
      </div>
    </header>
  );
}

export default Navbar;