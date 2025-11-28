"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
// import QuizPage from "@/app/page";
import { useSubUrlStore } from "@/store/useSubUrlStore";
import { FieldChoiceCard } from "@/components/FieldChoiceCard";

// The route is /dashboard/[section]/[topic], so we must expect both.
interface paramsType  {
  section: string; // e.g., 'quiz'
  topic: string;   // e.g., 'amazon'
  // Index signature to satisfy Next.js internal type constraints
  [key: string]: string | string[] | undefined; 
}

export default function DashboardValuePage() {
  
  // Assert the type using the generic argument
  const [tr, setTu] = useState(false);
  // We only need setValue to store the topic globally
  const { setValue } = useSubUrlStore();
  const params = useParams()
  // This extracts 'amazon' from /dashboard/quiz/amazon
  const sectionName = params.section as string | undefined
  // useEffect(() => {
  //   // This file's purpose is to load the quiz for the specific topic.
  //   if (params.topic) { 
  //     setValue(params.topic);
  //     console.log(`Setting quiz topic: ${params.topic}. Section is: ${params.section}`);
  //   }
  // }, [params.topic, setValue, params.section]);

  return (
    // Reverted back to QuizPage as intended for this final route.
    sectionName === 'quiz'? <FieldChoiceCard />: <h1>Coming soon</h1>
  );
}