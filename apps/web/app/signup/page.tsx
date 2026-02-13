import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "@doossh/ui";
import Link from "next/link";
import { signup } from "../auth/actions";

export default function SignupPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/20">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                type="text"
                                placeholder="Arjun Sharma"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="arjun@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button formAction={signup} className="w-full">
                                Create an account
                            </Button>
                        </div>
                        {searchParams?.error && (
                            <p className="text-sm text-red-500 text-center">
                                {searchParams.error}
                            </p>
                        )}
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="underline">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
