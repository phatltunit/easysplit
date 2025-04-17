"use client";

import React, { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CalculationResultsProps {
  participants: string[];
  expenses: any[];
}

interface TransactionBreakdown {
  byExpense: {
    [expenseId: string]: {
      [debtor: string]: {
        [creditor: string]: number
      }
    }
  },
  summary: {
    [debtor: string]: {
      [creditor: string]: number;
    };
  };
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

    const transactionsByExpense: { [expenseId: string]: { [debtor: string]: { [creditor: string]: number } } } = {};

    expenses.forEach((expense) => {
      const { id, name, payer, amount, involvedParticipants, splitEvenly, manualContributions } = expense;

      const expenseBalances: { [participant: string]: number } = {};
      involvedParticipants.forEach(participant => expenseBalances[participant] = 0);

      if (splitEvenly) {
        const splitAmount = amount / involvedParticipants.length;
        involvedParticipants.forEach(participant => {
          expenseBalances[participant] -= splitAmount;
        });
        expenseBalances[payer] += amount;
      } else if (manualContributions) {
        Object.entries(manualContributions).forEach(([participant, contribution]) => {
          expenseBalances[participant] -= contribution;
        });
        expenseBalances[payer] += amount;
      }

      const positiveExpenseBalances: { [participant: string]: number } = {};
      const negativeExpenseBalances: { [participant: string]: number } = {};

      Object.entries(expenseBalances).forEach(([participant, balance]) => {
        if (balance > 0) {
          positiveExpenseBalances[participant] = balance;
        } else if (balance < 0) {
          negativeExpenseBalances[participant] = Math.abs(balance);
        }
      });

      transactionsByExpense[id] = {};

      while (Object.keys(positiveExpenseBalances).length > 0 && Object.keys(negativeExpenseBalances).length > 0) {
        const creditor = Object.keys(positiveExpenseBalances).reduce((a, b) => positiveExpenseBalances[a] > positiveExpenseBalances[b] ? a : b);
        const debtor = Object.keys(negativeExpenseBalances).reduce((a, b) => negativeExpenseBalances[a] > negativeExpenseBalances[b] ? a : b);
        let settleAmount = Math.min(positiveExpenseBalances[creditor], negativeExpenseBalances[debtor]);

        if (!transactionsByExpense[id][debtor]) {
          transactionsByExpense[id][debtor] = {};
        }
        if (!transactionsByExpense[id][debtor][creditor]) {
          transactionsByExpense[id][debtor][creditor] = 0;
        }

        // If creditor already owes debtor, subtract from settleAmount
        if (transactionsByExpense[id][creditor] && transactionsByExpense[id][creditor][debtor]) {
          const existingDebt = transactionsByExpense[id][creditor][debtor];
          if (settleAmount > existingDebt) {
            settleAmount -= existingDebt;
            transactionsByExpense[id][creditor][debtor] = 0;
            delete transactionsByExpense[id][creditor][debtor];
          } else {
            transactionsByExpense[id][creditor][debtor] -= settleAmount;
            settleAmount = 0;
          }
        }

        transactionsByExpense[id][debtor][creditor] += settleAmount;


        positiveExpenseBalances[creditor] -= settleAmount;
        negativeExpenseBalances[debtor] -= settleAmount;

        if (positiveExpenseBalances[creditor] === 0) {
          delete positiveExpenseBalances[creditor];
        }
        if (negativeExpenseBalances[debtor] === 0) {
          delete negativeExpenseBalances[debtor];
        }
      }
    });

    // Summarize transactions across all expenses
    const summaryTransactions: { [participant: string]: { [participant: string]: number } } = {};

      // Initialize the summaryTransactions object
      participants.forEach(debtor => {
          summaryTransactions[debtor] = {};
          participants.forEach(creditor => {
              if (debtor !== creditor) {
                  summaryTransactions[debtor][creditor] = 0;
              }
          });
      });

      Object.values(transactionsByExpense).forEach(expenseTransactions => {
        Object.entries(expenseTransactions).forEach(([debtor, creditors]) => {
          Object.entries(creditors).forEach(([creditor, amount]) => {
            summaryTransactions[debtor][creditor] += amount;
          });
        });
      });

      // Consolidate debts: debtor owes creditor vs creditor owes debtor
      for (const debtor in summaryTransactions) {
          for (const creditor in summaryTransactions[debtor]) {
              if (summaryTransactions[creditor] && summaryTransactions[creditor][debtor]) {
                  const debtorToCreditor = summaryTransactions[debtor][creditor] || 0;
                  const creditorToDebtor = summaryTransactions[creditor][debtor] || 0;

                  if (debtorToCreditor > creditorToDebtor) {
                      summaryTransactions[debtor][creditor] = debtorToCreditor - creditorToDebtor;
                      delete summaryTransactions[creditor][debtor];
                  } else if (creditorToDebtor > debtorToCreditor) {
                      summaryTransactions[creditor][debtor] = creditorToDebtor - debtorToCreditor;
                      delete summaryTransactions[debtor][creditor];
                  } else {
                      delete summaryTransactions[debtor][creditor];
                      delete summaryTransactions[creditor][debtor];
                  }
              }
          }
      }

       // Correctly consolidate debts, ensuring amounts are non-negative
       for (const debtor in summaryTransactions) {
        for (const creditor in summaryTransactions[debtor]) {
            if (summaryTransactions[creditor] && summaryTransactions[creditor][debtor]) {
                let debtorToCreditor = summaryTransactions[debtor][creditor] || 0;
                let creditorToDebtor = summaryTransactions[creditor][debtor] || 0;

                if (debtorToCreditor > creditorToDebtor) {
                    summaryTransactions[debtor][creditor] = debtorToCreditor - creditorToDebtor;
                    delete summaryTransactions[creditor][debtor];
                } else if (creditorToDebtor > debtorToCreditor) {
                    // Invert the transaction: Debtor now becomes the creditor
                    summaryTransactions[creditor][debtor] = creditorToDebtor - debtorToCreditor;
                    delete summaryTransactions[debtor][creditor];
                } else {
                    delete summaryTransactions[debtor][creditor];
                    delete summaryTransactions[creditor][debtor];
                }
            }
        }
    }

    return { byExpense: transactionsByExpense, summary: summaryTransactions };
  };

  const [balances, setBalances] = useState<{ [participant: string]: number }>({});
  const [transactions, setTransactions]: any = useState({ byExpense: {}, summary: {} });

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
              <h4 className="text-md font-semibold mb-2">By Expense</h4>
              {Object.entries(transactions?.byExpense || {}).map(([expenseId, expenseTransactions]) => (
                <div key={expenseId} className="mb-4">
                  <h5 className="text-sm font-medium">Expense: {expenses.find(e => e.id === expenseId)?.name}</h5>
                  <ul>
                    {Object.entries(expenseTransactions).map(([debtor, creditors]) => (
                      Object.entries(creditors).map(([creditor, amount]) => (
                        <li key={`${debtor}-${creditor}`}>
                          {debtor} owes {creditor} ${amount.toFixed(2)}
                        </li>
                      ))
                    ))}
                  </ul>
                </div>
              ))}

              <h4 className="text-md font-semibold mt-4 mb-2">Summary</h4>
              <ul>
                  {Object.entries(transactions?.summary || {}).map(([debtor, creditors]) => (
                      Object.entries(creditors).map(([creditor, amount]) => {
                          if (debtor !== creditor && amount > 0) {
                              const transactionKey = `${debtor}-${creditor}`;
                              return (
                                  <li key={transactionKey}>
                                      {debtor} owes {creditor} ${amount.toFixed(2)} (Total)
                                  </li>
                              );
                          }
                          return null;
                      })
                  ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
