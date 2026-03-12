"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

interface AuthCardProps {
    onTransition: () => void;
}

export function AuthCard({ onTransition }: AuthCardProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [formData, setFormData] = useState({
        username: "", password: "", email: "", phone: "",
    });
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        if (activeTab === "login") {
            const res = await signIn.email({
                email: formData.get("email") as string,
                password: formData.get("password") as string,
            });
            if (res.error) {
                setError(res.error.message || "Credenciales incorrectas.");
                return;
            }

        } else {
            const res = await signUp.email({
                name: formData.get("name") as string,
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                phone: formData.get("phone") as string,
            });
            if (res.error) {
                setError(res.error.message || "Error al registrarse.");
                return;
            }
        }

        onTransition();
        router.push("/dashboard");
    };


    const signInWithGitHub = async () => {
        const data = await signIn.social({
            provider: "github",
            callbackURL: "/dashboard",
            errorCallbackURL: "/auth?error=github",
            fetchOptions: {
                onError: (ctx) => {
                    setError(ctx.error.message || "Error al iniciar sesión con GitHub.");
                }
            }
        })
    }


    return (
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="pt-6">
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => {
                        setActiveTab(v as "login" | "register");
                        setError(null);
                    }}
                    className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5">
                        <TabsTrigger value="login" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-white/70">
                            Iniciar Sesión
                        </TabsTrigger>
                        <TabsTrigger value="register" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-white/70">
                            Registrarse
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <LoginForm onSubmit={handleSubmit} error={error} />
                    </TabsContent>
                    <TabsContent value="register">
                        <RegisterForm onSubmit={handleSubmit} error={error} />
                    </TabsContent>
                </Tabs>

                <div className="relative my-6 flex items-center gap-3">
                    <div className="flex-1 border-t border-white/20" />
                    <span className="text-sm text-white/60 whitespace-nowrap">O continúa con</span>
                    <div className="flex-1 border-t border-white/20" />
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white py-6"
                    onClick={signInWithGitHub}
                >
                    <FaGithub className="mr-2 h-5 w-5" />
                    GitHub
                </Button>
            </CardContent>
        </Card>
    );
}