"use strict";
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRestaurantSchema, type Restaurant } from "@doossh/db"; // Shared schema
import { createRestaurant, updateRestaurant } from "../../app/(dashboard)/dashboard/restaurants/actions"; // Server Action
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    Switch,
} from "@doossh/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "../ui/image-upload";

interface RestaurantFormProps {
    initialData?: Restaurant;
}

export function RestaurantForm({ initialData }: RestaurantFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(createRestaurantSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            address: initialData?.address || "",
            cuisine_type: initialData?.cuisine_type || "",
            price_range: (initialData?.price_range as any) || "$",
            is_published: initialData?.is_published || false,
            cover_image: initialData?.cover_image || "",
        },
    });

    async function onSubmit(data: any) {
        setIsLoading(true);
        setServerError(null);

        const formData = new FormData();
        if (initialData) {
            formData.append("id", initialData.id);
        }
        formData.append("name", data.name);
        formData.append("description", data.description || "");
        formData.append("address", data.address || "");
        formData.append("cuisine_type", data.cuisine_type || "");
        formData.append("price_range", data.price_range || "$");
        formData.append("cover_image", data.cover_image || "");
        if (data.is_published) formData.append("is_published", "on");

        const result = initialData
            ? await updateRestaurant(null, formData)
            : await createRestaurant(null, formData);

        if (result?.error) {
            if (typeof result.error === 'string') {
                setServerError(result.error);
            } else {
                console.error(result.error);
                setServerError("Please check the form for errors.");
            }
            setIsLoading(false);
        } else {
            // Success - typically redirects
        }
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {serverError && (
                        <div className="bg-destructive/15 p-3 rounded-md text-destructive text-sm">
                            {serverError}
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="cover_image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cover Image</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        bucket="listings"
                                        onUpload={field.onChange}
                                        defaultValue={field.value}
                                        label="Upload Cover Image"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Restaurant Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Tell us about your venue..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="cuisine_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cuisine</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Italian, Indian..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price_range"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price Range</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select price range" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="$">$ (Cheap)</SelectItem>
                                            <SelectItem value="$$">$$ (Moderate)</SelectItem>
                                            <SelectItem value="$$$">$$$ (Expensive)</SelectItem>
                                            <SelectItem value="$$$$">$$$$ (Luxury)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_published"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Publish immediately</FormLabel>
                                    <div className="text-sm text-muted-foreground">
                                        Make this restaurant visible to the public.
                                    </div>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : (initialData ? "Update Restaurant" : "Create Restaurant")}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
