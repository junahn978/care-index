import { LoginForm } from "@/components/LoginForm";

export default function Page() {
  return (
    <div className="grid min-h-svh w-full laptop:grid-cols-2">
      {/* brand panel: placeholder until the company image is chosen; hidden on small screens */}
      <div className="hidden bg-linear-to-br from-teal-700 to-teal-950 p-16 laptop:block">
        <p className="text-fluid-2xl font-semibold tracking-tight text-white">
          Care<span className="text-teal-300">-Index</span>
        </p>
      </div>
      <div className="flex items-center justify-center p-6 tablet:p-10">
        <LoginForm className="w-full max-w-md" />
      </div>
    </div>
  );
}
