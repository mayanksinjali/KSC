import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import { listApplications } from "@/lib/data";

const HEADERS = ["Name", "Class", "Contact", "Message", "Status", "Submitted"];

function csvCell(value: string) {
  const clean = (value ?? "").replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${clean}"`;
}

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await listApplications();
  const rows = [
    HEADERS.join(","),
    ...applications.map((app) =>
      [
        csvCell(app.name),
        csvCell(app.class),
        csvCell(app.contact),
        csvCell(app.message),
        csvCell(app.status),
        csvCell(new Date(app.created_at).toISOString()),
      ].join(","),
    ),
  ];

  // BOM keeps Nepali/UTF-8 text readable when opened in Excel.
  const csv = `\uFEFF${rows.join("\r\n")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ksc-applications-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
