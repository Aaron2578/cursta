'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  // const [isDashboard, setIsDashboard] = useState(false);

  // 2. Refined handler function to prevent default link action
const handleDashboard = (e: React.MouseEvent<HTMLButtonElement>) => {
  // Crucial step: Prevent the default browser navigation (full page reload)
  e.preventDefault(); 
  // setIsDashboard(true);
  // 3. Perform client-side navigation
  router.push(`/dashboard/`);
  
  // console.log(`Navigating to: /dashboard/dashboard`);
  }
  return (
  <div className="h-screen flex justify-center items-center">
    <Button onClick={(e) => handleDashboard(e)}>Dashboard</Button>
  </div>
);}