import type { Metadata } from "next";
import { AccountPanel } from "@/components/account-panel";

export const metadata: Metadata = {
  title: "Your account | Deal Guru",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-14">
      <AccountPanel />
    </main>
  );
}
