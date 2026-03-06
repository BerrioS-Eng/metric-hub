import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RegisterFormProps {
    formData: { username: string; password: string; email: string; phone: string };
    onChange: (field: string, value: string) => void;
    onSubmit: (e: React.SyntheticEvent) => void;
}

export function RegisterForm({ formData, onChange, onSubmit }: RegisterFormProps) {

    const fields = [
        { id: "reg-username", field: "username", label: "Usuario", type: "text", placeholder: "Ingrese su usuario" },
        { id: "reg-password", field: "password", label: "Contraseña", type: "password", placeholder: "Ingrese su contraseña" },
        { id: "email", field: "email", label: "Correo", type: "email", placeholder: "correo@ejemplo.com" },
        { id: "phone", field: "phone", label: "Teléfono", type: "tel", placeholder: "+1234567890" },
    ];

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {fields.map(({ id, field, label, type, placeholder }) => (
                <div key={id} className="space-y-2">
                    <Label htmlFor={id} className="text-white">{label}</Label>
                    <Input
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        value={formData[field as keyof typeof formData]}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
                        required
                    />
                </div>
            ))}
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 ...">
                Registrarse
            </Button>
        </form>
    );
}