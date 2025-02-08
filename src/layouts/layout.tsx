import { ThemeProvider } from "@/providers/themeprovider";
import { Toaster } from "@/components/ui/sonner";
import { TanstackProvider } from "@/providers/tanstackProvider";
import { Outlet } from "react-router-dom";
import { ProtectRoutes } from "@/providers/protectRoutes";
import { UserProvider } from "@/providers/userProvider";
import { SocketIoClientProvider } from "@/providers/socketIoClientProvider";

export default function Layout() {
    return (
        <TanstackProvider>
            <UserProvider>
                <SocketIoClientProvider>
                    <ProtectRoutes>
                        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                            <Outlet />
                            <Toaster richColors closeButton position="top-center" duration={3000} />
                        </ThemeProvider>
                    </ProtectRoutes>
                </SocketIoClientProvider>
            </UserProvider>
        </TanstackProvider>
    )
}
