function WelcomeBanner() {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-lg">

      {/* Background Glow */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl"></div>

      <div className="relative z-10">

        <p className="text-sm uppercase tracking-widest text-blue-100">
          Research Lab Management System
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {greeting} 👋
        </h1>

        <p className="mt-3 max-w-2xl text-blue-100 text-lg">
          Welcome back. Monitor research projects, equipment,
          budgets, and team activities from one centralized dashboard.
        </p>

      </div>

    </div>
  );
}

export default WelcomeBanner;