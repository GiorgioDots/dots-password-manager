import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/register")({
    component: RouteComponent,
    loader: () => {
        if (localStorage.getItem("token")) {
            throw redirect({
                to: "/passwords",
            });
        }
    },
});

function RouteComponent() {
    return <div>Hello "/(auth)/register"!</div>;
}
