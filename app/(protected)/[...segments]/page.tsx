import { notFound } from "next/navigation";

import { findNavItem } from "@/lib/nav/lookup";
import ComingSoon from "@/components/shared/ComingSoon";
import DashboardLayout from "@/components/shared/DashboardLayout";

export default async function ProtectedPage({
    params,
}: {
    params: Promise<{
        segments?: string[];
    }>;
}) {
    const { segments = [] } = await params;
    const userName = "Admin";            // placeholder until you wire real auth
    const userRole = "Security Analyst";

    const fullPath =
        segments.length > 0
            ? `/${segments.join("/")}`
            : "/";

    /*
     * Find the page from the navigation configuration.
     */
    const navItem = findNavItem(fullPath);

    /*
     * If the URL doesn't exist in the navigation configuration,
     * treat it as a real 404.
     */
    if (!navItem) {
        notFound();
    }

    return (
        <DashboardLayout userName={userName} userRole={userRole} notificationCount={3}>
            <ComingSoon label={navItem.label} />
        </DashboardLayout>
    );
}