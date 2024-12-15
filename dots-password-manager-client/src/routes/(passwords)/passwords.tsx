import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import axiosInstance from "@/lib/axios";
import clientCrypto from "@/lib/client-crypto";
import { SavedPassword } from "@/lib/models/saved-password";
import { Separator } from "@radix-ui/react-separator";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(passwords)/passwords")({
    component: RouteComponent,
    loader: () => {
        if (!localStorage.getItem("token")) {
            throw redirect({
                to: "/login",
            });
        }
    },
});

function RouteComponent() {
    const { isPending, error, data } = useQuery({
        queryKey: ["passwords"],
        queryFn: () =>
            axiosInstance.get<SavedPassword[]>("/passwords").then((k) => {
                return clientCrypto.decryptPasswords(k.data);
            }),
    });

    if (isPending) return "Loading ...";

    if (error) return `An error has occurred: ${error.message}`;

    if (data == undefined) return `No data`;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Building Your Application
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        Data Fetching
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-auto min-h-0">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3 ">
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3 ">
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3 ">
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                    </div>
                </div>
            </SidebarInset>
            {/* {data.map((k) => (
                    <div key={k.Id}>{k.Id}{' - '}{k.Password}</div>
                ))} */}
        </SidebarProvider>
    );
}
