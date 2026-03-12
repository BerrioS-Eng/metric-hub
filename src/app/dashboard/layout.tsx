"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { MdLogout } from "react-icons/md";
import { useEffect } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/");
        }
    }, [isPending, session, router]);

    const user = session?.user;
    const isReady = !isPending && !!user;

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                },
            },
        });
    }

    return (
        <div className="min-h-screen relative">
            <div
                className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 transition-opacity duration-700"
                style={{ opacity: isReady ? 0 : 1, pointerEvents: isReady ? "none" : "auto" }}
            />
            {isReady && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="min-h-screen bg-gray-50"
                >
                    <header className="bg-white border-b">
                        <div className="container mx-auto px-4 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        MetricHub
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Manage your income, expenses, and users
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{user!.name}</p>
                                        <Badge variant={user!.role === "ADMIN" ? "default" : "secondary"}>
                                            {user!.role}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                    >
                                        <MdLogout className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </header>
                    {children}
                </motion.div>
            )}
        </div>
    );
}