import MeGate from "@/components/MeGate";

// every page that needs a signed-in user lives in this group, so /me is asked once per app load
// before any of them shows. /login and /auth/callback stay outside it and never ask
export default function SignedInLayout({ children }: LayoutProps<"/">) {
  return <MeGate>{children}</MeGate>;
}
