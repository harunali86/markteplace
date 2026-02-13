"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from "@doossh/ui";
import { createTicketType, deleteTicketType } from "../../app/(dashboard)/dashboard/events/[id]/tickets/actions";
import { Trash2, Plus } from "lucide-react";

interface TicketType {
    id: string;
    name: string;
    price: number;
    capacity: number;
    sold_count: number;
}

export function TicketTypeManager({ eventId, initialTypes }: { eventId: string; initialTypes: TicketType[] }) {
    const [types, setTypes] = useState<TicketType[]>(initialTypes);
    const [isAdding, setIsAdding] = useState(false);

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("event_id", eventId);

        const result = await createTicketType(formData);
        if (result.success) {
            toast.success("Ticket type added");
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to add ticket type");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return;
        const result = await deleteTicketType(id, eventId);
        if (result.success) {
            toast.success("Ticket type deleted");
            setTypes(types.filter(t => t.id !== id));
        } else {
            toast.error(result.error || "Failed to delete");
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ticket Tiers</CardTitle>
                <Button onClick={() => setIsAdding(!isAdding)} variant="outline" size="sm">
                    {isAdding ? "Cancel" : <Plus className="h-4 w-4 mr-2" />}
                    {isAdding ? "Cancel" : "Add Tier"}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {isAdding && (
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-md bg-muted/30">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input name="name" placeholder="e.g. VIP, Early Bird" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Price (INR)</Label>
                            <Input type="number" name="price" placeholder="0 for free" min="0" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Capacity</Label>
                            <Input type="number" name="capacity" defaultValue="100" min="1" required />
                        </div>
                        <Button type="submit">Save Tier</Button>
                    </form>
                )}

                <div className="space-y-2">
                    {types.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6 text-sm">No ticket tiers defined. Add tiered pricing to start selling.</p>
                    ) : (
                        types.map((type) => (
                            <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                                <div>
                                    <h4 className="font-semibold">{type.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        ₹{type.price} • {type.sold_count} / {type.capacity} sold
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
