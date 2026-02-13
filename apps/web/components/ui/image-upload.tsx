"use client";

import { ChangeEvent, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { Button } from "@doossh/ui";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    bucket: string;
    folder?: string;
    onUpload: (url: string) => void;
    defaultValue?: string | null;
    label?: string;
}

export function ImageUpload({
    bucket,
    folder = "uploads",
    onUpload,
    defaultValue,
    label = "Upload Image",
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(defaultValue || null);
    const supabase = createClient();

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${folder}/${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) {
                throw error;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            setPreview(publicUrl);
            onUpload(publicUrl);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload("");
    };

    return (
        <div className="flex flex-col gap-4">
            {preview ? (
                <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
                    <Image
                        src={preview}
                        alt="Upload preview"
                        fill
                        className="object-cover"
                    />
                    <Button
                        onClick={handleRemove}
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6"
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => document.getElementById("file-upload")?.click()}
                    >
                        {isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        {label}
                    </Button>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </div>
            )}
        </div>
    );
}
