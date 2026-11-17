import HomePage from "@/components/HomePage";

// the layout's MeGate holds every signed-in page back until /me answers, so Next.js's
// instant-navigation check (Cache Components) never sees this page and reports it as
// dropped. That order is on purpose (check who's signed in before loading anything),
// so the page opts out. "use client" files can't export route segment config, which is
// why the page itself lives in components/
export const instant = false;

export default function Page() {
  return <HomePage />;
}
