import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";

export const metadata: Metadata = {
  title: "Admin | Deal Guru",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 pt-10 pb-16">
      <h1 className="display text-6xl">Deal admin</h1>
      <p className="mt-2 mb-6 text-lg">Add, edit and remove the deals shoppers see.</p>
      <AdminPanel />
    </main>
  );
}
