"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Textarea, Switch, toast } from "@doossh/ui";
import { ImageUpload } from "../ui/image-upload";
import { createEvent, updateEvent } from "../../app/(dashboard)/dashboard/events/actions";

export function EventForm({
    vendorId,
    initialData
}: {
    vendorId?: string;
    initialData?: any
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
    const [isPublished, setIsPublished] = useState(initialData?.is_published || false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        if (vendorId) formData.append("vendor_id", vendorId);
        formData.append("cover_image", coverImage);
        formData.append("is_published", isPublished.toString());

        try {
            let result;
            if (initialData?.id) {
                result = await updateEvent(initialData.id, formData);
            } else {
                result = await createEvent(formData);
            }

            if (result.success) {
                toast.success(initialData?.id ? "Event updated" : "Event created");
                router.push("/dashboard/events");
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Event Name</Label>
                    <Input id="name" name="name" defaultValue={initialData?.name} placeholder="e.g. Neon Nights" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={initialData?.description} placeholder="What is this event about?" rows={4} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="event_date">Date & Time</Label>
                        <Input
                            id="event_date"
                            name="event_date"
                            type="datetime-local"
                            defaultValue={initialData?.event_date ? new Date(initialData.event_date).toISOString().slice(0, 16) : ""}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" defaultValue={initialData?.location} placeholder="Venue name or address" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Event Poster</Label>
                    <ImageUpload
                        bucket="listings"
                        onUpload={setCoverImage}
                        defaultValue={coverImage}
                        label="Upload Poster"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_published"
                        checked={isPublished}
                        onCheckedChange={setIsPublished}
                    />
                    <Label htmlFor="is_published">Publish Event</Label>
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : initialData?.id ? "Update Event" : "Create Event"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
