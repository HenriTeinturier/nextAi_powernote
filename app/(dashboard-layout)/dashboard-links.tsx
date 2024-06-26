import type { NavigationLinkGroups } from "@/features/navigation/navigation.type";
import { LayoutDashboard, MessageCircle, Settings } from "lucide-react";

export const DASHBOARD_LINKS: NavigationLinkGroups[] = [
  {
    links: [
      {
        title: "Dashboard",
        icon: <LayoutDashboard />,
        url: "/dashboard",
      },
      {
        title: "Configuration",
        icon: <Settings />,
        url: "/configuration",
      },
      {
        title: "Chat",
        icon: <MessageCircle />,
        url: "/chat",
      },
    ],
  },
];
