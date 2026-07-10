import { NextResponse } from "next/server";

import { isSuperAdminApiError, requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { fetchTeacherLibraryRows } from "@/lib/library/fetch-library-catalog";
import { buildTeacherLibraryCatalog } from "@/lib/library/teacher-library-catalog";

export async function GET() {
  const auth = await requireSuperAdminApi();
  if (isSuperAdminApiError(auth)) return auth;

  const rows = await fetchTeacherLibraryRows();
  const catalog = buildTeacherLibraryCatalog(rows);

  return NextResponse.json({
    catalog,
    stats: {
      total: catalog.length,
      inDatabase: catalog.filter((item) => item.inDatabase).length,
      pendingUpload: catalog.filter((item) => !item.inDatabase).length,
      published: catalog.filter((item) => item.isPublished).length,
      allenGirls: catalog.filter((item) => item.wing === "allen_girls").length,
      licensed: catalog.filter((item) => item.wing === "licensed").length,
      sharedCatalog: true,
    },
  });
}
