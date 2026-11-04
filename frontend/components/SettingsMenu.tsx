import Link from "next/link";
import { LockKeyhole, ShieldUser, Users, type LucideIcon } from "lucide-react";
import { cn } from "cn";

export type SettingsPageKey = "security" | "delegation" | "disclosure-logs";

// the settings pages, in menu order. Only Care Delegates is built so far; the other links show
// "page not found" until their pages exist
const SETTINGS_PAGES: {
  key: SettingsPageKey;
  label: string;
  href: string;
  icon: LucideIcon;
  // short status shown beside the label
  status?: string;
}[] = [
  {
    key: "security",
    label: "Account Security",
    href: "/security",
    icon: LockKeyhole,
    // placeholder from the design: the app has no two-factor sign-in yet
    status: "2FA Active",
  },
  {
    key: "delegation",
    label: "Care Delegates",
    href: "/delegation",
    icon: Users,
  },
  {
    key: "disclosure-logs",
    label: "Data Disclosure Logs",
    href: "/disclosure-logs",
    icon: ShieldUser,
  },
];

// the menu beside every settings page; `current` is the page being shown, highlighted in green
// with a dot
export default function SettingsMenu({
  current,
}: {
  current: SettingsPageKey;
}) {
  return (
    <nav
      aria-labelledby="settings-menu-heading"
      className="rounded-2xl border bg-card p-3 shadow-sm"
    >
      <h2
        id="settings-menu-heading"
        className="px-3 pt-2 pb-3 text-fluid-sm tracking-widest text-muted-foreground uppercase"
      >
        Settings Menu
      </h2>
      <ul className="flex flex-col gap-1">
        {SETTINGS_PAGES.map(({ key, label, href, icon: Icon, status }) => {
          const isCurrent = key === current;
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 leading-snug transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isCurrent
                    ? "bg-[#008378] font-medium text-white"
                    : "hover:bg-[#EFFFFB]",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-[1.15em] shrink-0",
                    !isCurrent && "text-muted-foreground",
                  )}
                />
                <span className="min-w-0 flex-1">{label}</span>
                {status && (
                  // a template string, not cn: cn reads text-fluid-sm as a text color and drops it
                  <span
                    className={`shrink-0 text-fluid-sm ${isCurrent ? "text-white/85" : "text-muted-foreground"}`}
                  >
                    {status}
                  </span>
                )}
                {isCurrent && (
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-white"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
