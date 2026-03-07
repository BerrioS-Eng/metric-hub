"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { MdLogout } from "react-icons/md";
import { useEffect, useState } from "react";
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

    if (isPending) return <p className="text-center mt-8 text-white">Loading...</p>;
    if (!session?.user) return <p className="text-center mt-8 text-white">Redirecting...</p>;

    const { user } = session;
    console.log("User session:", user);
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
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
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
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <Badge variant={user ? "default" : "secondary"}>
                                        {user.role}
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
        </AnimatePresence>
    );
}