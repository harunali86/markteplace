import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "@doossh/ui";
import Link from "next/link";
import { forgotPassword } from "../auth/actions";

export default function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: { message?: string; error?: string };
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/20">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <Button formAction={forgotPassword} className="w-full">
                            Send Reset Link
                        </Button>
                        {searchParams?.message && (
                            <p className="text-sm text-green-600 text-center">
                                {searchParams.message}
                            </p>
                        )}
                        {searchParams?.error && (
                            <p className="text-sm text-red-500 text-center">
                                {searchParams.error}
                            </p>
                        )}
                        <div className="mt-4 text-center text-sm">
                            Remember your password?{" "}
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
