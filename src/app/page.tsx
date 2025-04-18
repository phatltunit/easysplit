"use client";

import { useState } from "react";
import { ParticipantManager } from "@/components/ParticipantManager";
import { ExpenseManager } from "@/components/ExpenseManager";
import { CalculationResults } from "@/components/CalculationResults";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  interface Expense {
    id: string;
    name: string;
    amount: number;
    payer: string;
    involvedParticipants: string[];
    splitEvenly: boolean;
    manualContributions?: { [participant: string]: number };
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6 text-center">Bill Splitter</h1>

      <Tabs defaultValue="participants" className="w-full">
        <TabsList className="justify-center">
          <TabsTrigger value="participants">Thành viên</TabsTrigger>
          <TabsTrigger value="expenses">Chi tiêu</TabsTrigger>
          <TabsTrigger value="results">Kết quả</TabsTrigger>
        </TabsList>
        <TabsContent value="participants" className="mt-6">
        
              <ParticipantManager
                participants={participants}
                setParticipants={setParticipants}
                expenses={expenses}
              />
         
        </TabsContent>
        <TabsContent value="expenses" className="mt-6">
        
              <ExpenseManager
                participants={participants}
                expenses={expenses}
                setExpenses={setExpenses}
              />
         
        </TabsContent>
        <TabsContent value="results" className="mt-6">
       
              <CalculationResults
                participants={participants}
                expenses={expenses}
              />
         
        </TabsContent>
      </Tabs>

      <Separator className="my-6" />
      <Footer />
    </div>
  );
}
