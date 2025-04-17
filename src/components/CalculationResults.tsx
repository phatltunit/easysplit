"use client";

import React, { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CalculationResultsProps {
  participants: string[];
  expenses: any[];
}

export const CalculationResults: React.FC<CalculationResultsProps> = ({
  participants,
  expenses,
}) => {
  const calculateBalances = () => {
    const balances: { [participant: string]: number } = {};

    // Initialize balances for all participants
    participants.forEach((participant) => {
      balances[participant] = 0;
    });

    expenses.forEach((expense) => {
      const { payer, amount, involvedParticipants, splitEvenly, manualContributions } = expense;

      if (splitEvenly) {
        const splitAmount = amount / involvedParticipants.length;
        involvedParticipants.forEach((participant) => {
          balances[participant] -= splitAmount;
        });
        balances[payer] += amount;
      } else if (manualContributions) {
        Object.entries(manualContributions).forEach(([participant, contribution]) => {
          balances[participant] -= contribution;
        });
        balances[payer] += amount;
      }
    });

    return balances;
  };

  const generateTransactionBreakdown = () => {
    const balances = calculateBalances();
    const positiveBalances: { [participant: string]: number } = {};
    const negativeBalances: { [participant: string]: number } = {};

    // Separate participants into those who are owed money and those who owe money
    Object.entries(balances).forEach(([participant, balance]) => {
      if (balance > 0) {
        positiveBalances[participant] = balance;
      } else if (balance < 0) {
        negativeBalances[participant] = Math.abs(balance);
      }
    });

    const transactions: string[] = [];

    // Generate transactions to settle debts
    while (Object.keys(positiveBalances).length > 0 && Object.keys(negativeBalances).length > 0) {
      const creditor = Object.keys(positiveBalances).reduce((a, b) => positiveBalances[a] > positiveBalances[b] ? a : b);
      const debtor = Object.keys(negativeBalances).reduce((a, b) => negativeBalances[a] > negativeBalances[b] ? a : b);
      const amount = Math.min(positiveBalances[creditor], negativeBalances[debtor]);

      transactions.push(`${debtor} owes ${creditor} $${amount.toFixed(2)}`);

      positiveBalances[creditor] -= amount;
      negativeBalances[debtor] -= amount;

      if (positiveBalances[creditor] === 0) {
        delete positiveBalances[creditor];
      }
      if (negativeBalances[debtor] === 0) {
        delete negativeBalances[debtor];
      }
    }

    return transactions;
  };

  const [balances, setBalances] = useState<{ [participant: string]: number }>({});
  const [transactions, setTransactions] = useState<string[]>([]);

  useEffect(() => {
    setBalances(calculateBalances());
    setTransactions(generateTransactionBreakdown());
  }, [participants, expenses]);


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculation Results</CardTitle>
        <CardDescription>
          View individual contributions and transaction breakdown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          <AccordionItem value="individualSummary">
            <AccordionTrigger>Individual Summary</AccordionTrigger>
            <AccordionContent>
              <ul>
                {Object.entries(balances).map(([participant, balance]) => (
                  <li key={participant}>
                    {participant}: ${balance.toFixed(2)}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="transactionBreakdown">
            <AccordionTrigger>Transaction Breakdown</AccordionTrigger>
            <AccordionContent>
              <ul>
                {transactions.map((transaction, index) => (
                  <li key={index}>{transaction}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
