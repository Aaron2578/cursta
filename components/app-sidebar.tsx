'use client'
import * as React from "react"
import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useState, useEffect } from "react" // Import useEffect
import { useRouter, usePathname } from "next/navigation";
import { useSubUrlStore } from "@/store/useSubUrlStore"

// This is sample data.
const data = {
  versions: ["Anonymous"],
  navMain: [
    {
      title: "Practice",
      url: "#",
      items: [
        {
          title: "Quiz",
          url: "quiz",
        },
        {
          title: "DSA Problems",
          url: "dsa-problems",
        },
        {
          title: "Mock Interview",
          url: "mock-interview",
        },
        {
          title: "Frontend Problems",
          url: "frontend-problems",
        },
        {
          title: "Linux Problems",
          url: "linux-problems",
        }
      ],
    },
    {
      title: "Progress",
      url: "#",
      items: [
        {
          title: "Roadmap",
          url: "roadmap",
        },
        {
          title: "Statistics",
          url: "statistics",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname(); // e.g., /dashboard/statistics
  const { value, setValue } = useSubUrlStore(); // Assuming this is still used

  // 1. Initialize activeItem based on the current URL subpath
  // This ensures the sidebar is correctly highlighted on page load/refresh.
  const initialActiveItem = React.useMemo(() => {
    const segments = pathname.split('/');
    const currentSubpath = segments[segments.length - 1]; // e.g., 'statistics'

    for (const group of data.navMain) {
      const item = group.items.find(i => i.url === currentSubpath);
      if (item) {
        return item.title;
      }
    }
    // Default to a specific item if no match is found, or null
    return "Quiz"; 
  }, [pathname]);

  const [activeItem, setActiveItem] = useState(initialActiveItem);

  // 2. Refined handler function to prevent default link action
  const handleSwitchTabs = (title: string, url: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    // Crucial step: Prevent the default browser navigation (full page reload)
    e.preventDefault(); 
    
    // 3. Perform client-side navigation
    router.push(`/dashboard/${encodeURIComponent(url)}`);
    
    // 4. Update the active state for visual feedback
    setActiveItem(title);
    
    console.log(`Navigating to: /dashboard/${url}`);
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => {
                  const isActive = subItem.title === activeItem
                  return (
                  <SidebarMenuItem key={subItem.title}>
                    {/* SidebarMenuButton passes props to the <a> tag via asChild */}
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      // Remove onClick from here, it should be on the <a> tag
                    >
                      <a 
                        href={`/dashboard/${subItem.url}`} // Use full href for correctness/accessibility
                        onClick={(e) => handleSwitchTabs(subItem.title, subItem.url, e)} // Pass the event
                      >
                        {subItem.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}