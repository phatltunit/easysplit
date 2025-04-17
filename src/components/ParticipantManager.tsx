"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";

interface ParticipantManagerProps {
  participants: string[];
  setParticipants: (participants: string[]) => void;
  expenses: any[];
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  setParticipants,
  expenses,
}) => {
  const [newParticipant, setNewParticipant] = useState("");
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(false);

  useEffect(() => {
    // Check if any participant is associated with an expense
    const associated = participants.some((participant) =>
      expenses.some((expense: { involvedParticipants: string[] }) =>
        expense.involvedParticipants.includes(participant)
      )
    );
    setIsDeleteDisabled(associated);
  }, [participants, expenses]);

  const addParticipant = () => {
    if (newParticipant && !participants.includes(newParticipant)) {
      setParticipants([...participants, newParticipant]);
      setNewParticipant("");
      toast({
        title: "Participant added!",
        description: `Added ${newParticipant} to the list.`,
      });
    } else if (participants.includes(newParticipant)) {
      toast({
        title: "Error!",
        description: "Participant already exists.",
        variant: "destructive",
      });
    }
  };

  const deleteParticipant = (participantToDelete: string) => {
    if (
      expenses.some((expense: { involvedParticipants: string[] }) =>
        expense.involvedParticipants.includes(participantToDelete)
      )
    ) {
      toast({
        title: "Cannot delete!",
        description:
          "Participant is associated with an existing expense and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setParticipants(
      participants.filter((participant) => participant !== participantToDelete)
    );
    toast({
      title: "Participant deleted!",
      description: `Deleted ${participantToDelete} from the list.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Participants</CardTitle>
        <CardDescription>
          Add, edit, or delete participants. Participants associated with
          existing expenses cannot be deleted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Participant Name"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
          />
          <Button onClick={addParticipant}>Add</Button>
        </div>
        <ScrollArea className="h-[200px] w-full rounded-md border">
          <div className="p-4">
            {participants.map((participant) => (
              <div
                key={participant}
                className="flex items-center justify-between mb-2"
              >
                <span>{participant}</span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteParticipant(participant)}
                  disabled={isDeleteDisabled}
                >
                  <Icons.trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
