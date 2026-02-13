import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "@doossh/ui";
import Link from "next/link";
import { login } from "../auth/actions";

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/20">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button formAction={login} className="w-full">
                                Login
                            </Button>
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or try demo
                                    </span>
                                </div>
                            </div>
                            <Link href="/dashboard" className="w-full">
                                <Button variant="outline" className="w-full">
                                    Guest Admin Access
                                </Button>
                            </Link>
                        </div>
                        {searchParams?.error && (
                            <p className="text-sm text-red-500 text-center">
                                {searchParams.error}
                            </p>
                        )}
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
