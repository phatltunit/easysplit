"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";

interface ExpenseManagerProps {
  participants: string[];
  expenses: any[];
  setExpenses: (expenses: any[]) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  participants,
  expenses,
  setExpenses,
}) => {
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [payer, setPayer] = useState("");
  const [involvedParticipants, setInvolvedParticipants] = useState<string[]>([]);
  const [splitEvenly, setSplitEvenly] = useState(true);
  const [manualContributions, setManualContributions] = useState<{
    [participant: string]: number;
  }>({});

  useEffect(() => {
    // Initialize manualContributions when participants change
    const initialContributions: { [participant: string]: number } = {};
    participants.forEach((participant) => {
      initialContributions[participant] = 0;
    });
    setManualContributions(initialContributions);
  }, [participants]);

  const addExpense = () => {
    if (!expenseName || !amount || !payer || involvedParticipants.length === 0) {
      toast({
        title: "Error!",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!splitEvenly) {
      const totalManualContribution = Object.values(manualContributions).reduce(
        (sum, contribution) => sum + contribution,
        0
      );
      if (totalManualContribution !== amount) {
        toast({
          title: "Error!",
          description:
            "Sum of manual contributions does not match the total expense amount.",
          variant: "destructive",
        });
        return;
      }
    }

    const newExpense = {
      id: uuidv4(),
      name: expenseName,
      amount: amount,
      payer: payer,
      involvedParticipants: involvedParticipants,
      splitEvenly: splitEvenly,
      manualContributions: splitEvenly ? undefined : manualContributions,
    };

    setExpenses([...expenses, newExpense]);
    setExpenseName("");
    setAmount(undefined);
    setPayer("");
    setInvolvedParticipants([]);
    setSplitEvenly(true);
    setManualContributions({});

    toast({
      title: "Expense added!",
      description: `Added expense ${expenseName}.`,
    });
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== expenseId));
    toast({
      title: "Expense deleted!",
      description: `Expense deleted successfully.`,
    });
  };

  const toggleSelectAll = () => {
    if (involvedParticipants.length === participants.length) {
      setInvolvedParticipants([]);
    } else {
      setInvolvedParticipants([...participants]);
    }
  };

  const updateManualContribution = (
    participant: string,
    contribution: number
  ) => {
    setManualContributions({
      ...manualContributions,
      [participant]: contribution,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Expenses</CardTitle>
        <CardDescription>Add, edit, or delete expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="expenseName">Expense Name</Label>
            <Input
              type="text"
              id="expenseName"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="number"
              id="amount"
              value={amount !== undefined ? amount.toString() : ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="payer">Payer</Label>
            <Select value={payer} onValueChange={setPayer}>
              <SelectTrigger>
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((participant) => (
                  <SelectItem key={participant} value={participant}>
                    {participant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Involved Participants</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {involvedParticipants.length === participants.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {participants.map((participant) => (
                <div key={participant} className="flex items-center space-x-2">
                  <Checkbox
                    id={participant}
                    checked={involvedParticipants.includes(participant)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setInvolvedParticipants([
                          ...involvedParticipants,
                          participant,
                        ]);
                      } else {
                        setInvolvedParticipants(
                          involvedParticipants.filter((p) => p !== participant)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={participant} className="capitalize">
                    {participant}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="splitEvenly">Split Evenly</Label>
            <Switch
              id="splitEvenly"
              checked={splitEvenly}
              onCheckedChange={setSplitEvenly}
            />
          </div>
          {!splitEvenly && (
            <div>
              <Label>Manual Contributions</Label>
              <div className="grid gap-2">
                {participants.map((participant) => (
                  <div
                    key={participant}
                    className="flex items-center space-x-2"
                  >
                    <Label htmlFor={participant} className="capitalize w-24">
                      {participant}
                    </Label>
                    <Input
                      type="number"
                      id={participant}
                      value={manualContributions[participant]?.toString() || "0"}
                      onChange={(e) =>
                        updateManualContribution(
                          participant,
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button onClick={addExpense}>Add Expense</Button>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Existing Expenses</h3>
          <ScrollArea className="h-[200px] w-full rounded-md border">
            <div className="p-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="mb-4 p-4 rounded-md border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{expense.name}</p>
                    </div>
                    <Button
                      size="icon"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      <Icons.trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                  <p>Amount: {formatCurrency(expense.amount)}</p>
                  <p>Payer: {expense.payer}</p>
                  <p>Involved: {expense.involvedParticipants.join(', ')}</p>
                  <p>Split Evenly: {expense.splitEvenly ? 'Yes' : 'No'}</p>
                  {!expense.splitEvenly && expense.manualContributions && (
                    <div>
                      <p>Manual Contributions:</p>
                      <ul>
                        {Object.entries(expense.manualContributions).map(([participant, contribution]) => (
                          <li key={participant}>
                            {participant}: {formatCurrency(contribution)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
