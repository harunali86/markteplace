import {
    Button,
    Input,
    Label,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@doossh/ui";
import { createVendor } from "./actions";

export default function OnboardingPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/20">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        Create your Vendor Profile
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createVendor} className="grid gap-4">
                        {searchParams?.error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {searchParams.error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Business Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="My Awesome Venue"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="my-awesome-venue"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                This will be your unique URL identifier.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="restaurant">Restaurant</SelectItem>
                                    <SelectItem value="nightclub">Nightclub</SelectItem>
                                    <SelectItem value="party_hall">Party Hall</SelectItem>
                                    <SelectItem value="activity">Activity Center</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <Button type="submit" className="w-full">
                                Create Vendor
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
