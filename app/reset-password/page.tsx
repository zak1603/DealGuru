import type { Metadata } from "next";
import { ResetPasswordPanel } from "@/components/reset-password-panel";

export const metadata: Metadata = {
  title: "Choose a new password | Deal Guru",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-10 pb-16">
      <h1 className="display mb-6 text-6xl">New password</h1>
      <ResetPasswordPanel />
    </main>
  );
}
