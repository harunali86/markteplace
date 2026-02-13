"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast } from "@doossh/ui";
import { createTimeSlot, deleteTimeSlot } from "../../app/(dashboard)/dashboard/restaurants/[id]/slots/actions";
import { Trash2 } from "lucide-react";

interface Slot {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    capacity: number;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function SlotManager({ restaurantId, initialSlots }: { restaurantId: string; initialSlots: Slot[] }) {
    const [slots, setSlots] = useState<Slot[]>(initialSlots);
    const [isAdding, setIsAdding] = useState(false);

    async function handleAddSlot(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("restaurant_id", restaurantId);

        const result = await createTimeSlot(formData);
        if (result.success) {
            toast.success("Time slot added");
            // Ideally re-fetch or use optimistic updates. For MVP, we refresh.
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to add slot");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return;
        const result = await deleteTimeSlot(id, restaurantId);
        if (result.success) {
            toast.success("Slot deleted");
            setSlots(slots.filter(s => s.id !== id));
        } else {
            toast.error(result.error || "Failed to delete");
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Manage Availability</CardTitle>
                    <Button onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? "Cancel" : "Add Time Slot"}
                    </Button>
                </CardHeader>
                <CardContent>
                    {isAdding && (
                        <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-8 p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-2">
                                <Label>Day</Label>
                                <Select name="day_of_week" defaultValue="1">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS.map((day, i) => (
                                            <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input type="time" name="start_time" required />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input type="time" name="end_time" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Capacity (Tables)</Label>
                                <Input type="number" name="capacity" defaultValue="10" min="1" required />
                            </div>
                            <Button type="submit">Save Slot</Button>
                        </form>
                    )}

                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="p-3 text-left">Day</th>
                                    <th className="p-3 text-left">Time Range</th>
                                    <th className="p-3 text-left">Capacity</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slots.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                            No slots defined. Add your first time slot to start accepting bookings.
                                        </td>
                                    </tr>
                                ) : (
                                    slots.map((slot) => (
                                        <tr key={slot.id} className="border-t">
                                            <td className="p-3 font-medium">{DAYS[slot.day_of_week]}</td>
                                            <td className="p-3">{slot.start_time} - {slot.end_time}</td>
                                            <td className="p-3">{slot.capacity} tables</td>
                                            <td className="p-3 text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(slot.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
