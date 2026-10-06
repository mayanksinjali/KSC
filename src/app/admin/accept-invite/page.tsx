import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AcceptAdminInviteForm } from "@/components/admin/AcceptAdminInviteForm";

export const dynamic = "force-dynamic";

export default function AcceptAdminInvitePage() {
  return (
    <div className="container-page flex min-h-dvh flex-col items-center justify-center py-16">
      <div className="w-full max-w-md">
        <Link
          href="/admin/login"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-teal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Admin sign in
        </Link>
        <AcceptAdminInviteForm />
      </div>
    </div>
  );
}
