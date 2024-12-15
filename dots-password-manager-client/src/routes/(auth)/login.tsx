import { Button } from "@/components/ui/button";
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    // FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { Label } from "@radix-ui/react-label";
// import { useForm } from "@tanstack/react-form";
import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
    // Link
} from "@tanstack/react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";
import axiosInstance from "@/lib/axios";
import { AuthResponse } from "@/lib/models/auth-response";

export const Route = createFileRoute("/(auth)/login")({
    component: RouteComponent,
    loader: () => {
        if (localStorage.getItem("token")) {
            throw redirect({
                to: "/passwords",
            });
        }
    },
});

const loginSchema = z.object({
    login: z.string().min(1, { message: "Login is required" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});

function RouteComponent() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            login: "",
            password: "",
        },
    });
    async function onSubmit(values: z.infer<typeof loginSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values);
        const response = await axiosInstance.post<AuthResponse>("/auth/login", values);
        localStorage.setItem('token', response.data.Token);
        localStorage.setItem('refreshToken', response.data.RefreshToken);
        navigate({
          to: '/passwords'
        })
    }
    return (
        <main className="h-full content-center">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your email or username below to login
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="grid gap-4"
                        >
                            <div className="grid gap-2">
                                <FormField
                                    control={form.control}
                                    name="login"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor={field.name}>
                                                Login
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="m@example.com or john_doe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={
                                                            showPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        {...field}
                                                        className="pr-10"
                                                    />
                                                    <div className="absolute right-4 top-0 h-full content-center">
                                                        {showPassword ? (
                                                            <HiEye
                                                                className="z-10 cursor-pointer"
                                                                onClick={() => {
                                                                    setShowPassword(
                                                                        !showPassword
                                                                    );
                                                                }}
                                                            />
                                                        ) : (
                                                            <HiEyeSlash
                                                                className="z-10 cursor-pointer"
                                                                onClick={() =>
                                                                    setShowPassword(
                                                                        !showPassword
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                            <FormDescription>
                                                <Link
                                                    href="#"
                                                    className="ml-auto inline-block text-sm underline"
                                                >
                                                    Forgot your password?
                                                </Link>
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Login</Button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="underline"
                            >
                                Sign up
                            </Link>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </main>
        // <form className="h-full content-center">
        //     <Card className="mx-auto max-w-sm">
        //         <CardHeader>
        //             <CardTitle className="text-2xl">Login</CardTitle>
        //             <CardDescription>
        //                 Enter your email or username below to login
        //             </CardDescription>
        //         </CardHeader>
        //         <CardContent>
        //             <div className="grid gap-4">
        //                 <div className="grid gap-2">
        //                     <form.Field
        //                         name="login"
        //                         children={(field) => (
        //                             <>
        //                                 <Label htmlFor={field.name}>
        //                                     Email / Username
        //                                 </Label>
        //                                 <Input
        //                                     id={field.name}
        //                                     name={field.name}
        //                                     value={field.state.value}
        //                                     onBlur={field.handleBlur}
        //                                     onChange={(e) =>
        //                                         field.handleChange(
        //                                             e.target.value
        //                                         )
        //                                     }
        //                                     placeholder="m@example.com or john_doe"
        //                                 />
        //                                 {field.state.meta.errors ? (
        //                                     <em role="alert">
        //                                         {field.state.meta.errors.join(
        //                                             ", "
        //                                         )}
        //                                     </em>
        //                                 ) : null}
        //                             </>
        //                         )}
        //                     />
        //                 </div>
        //                 <div className="grid gap-2">
        //                     <div className="flex items-center">
        //                         <Label htmlFor="password">Password</Label>
        //                         <Link
        //                             href="#"
        //                             className="ml-auto inline-block text-sm underline"
        //                         >
        //                             Forgot your password?
        //                         </Link>
        //                     </div>
        //                     <Input
        //                         id="password"
        //                         type="password"
        //                         required
        //                     />
        //                 </div>
        //                 <Button
        //                     type="submit"
        //                     className="w-full"
        //                 >
        //                     Login
        //                 </Button>
        //             </div>
        //             <div className="mt-4 text-center text-sm">
        //                 Don&apos;t have an account?{" "}
        //                 <Link
        //                     href="/register"
        //                     className="underline"
        //                 >
        //                     Sign up
        //                 </Link>
        //             </div>
        //         </CardContent>
        //     </Card>
        // </form>
    );
}
