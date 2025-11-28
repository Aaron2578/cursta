"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useSubUrlStore } from "@/store/useSubUrlStore";
import QuizPage from "@/components/custom/quiz-page";
// 1. Define the corrected interface with the Index Signature
interface paramsType  {
  topic: string; 
  [key: string]: string | string[] | undefined; 
}

export default function DashboardValuePage() {
  
  // 3. Pass the corrected interface as a generic argument
  const params = useParams<paramsType>(); 
  
  const { setValue } = useSubUrlStore();

//   useEffect(() => {
//     // You can safely access params.topic here
//     if (params.section) { 
//       setValue(params.topic);
//       console.log(params.topic);
//     }
//   }, [params.topic, setValue]);

  return (
    <QuizPage />
  );
}