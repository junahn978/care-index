import DelegationPage from "@/components/DelegationPage";

// same as the home page (app/(signed-in)/page.tsx): MeGate holds this page back until /me
// answers, on purpose, so it opts out of the instant-navigation check
export const instant = false;

export default function Page() {
  return <DelegationPage />;
}
