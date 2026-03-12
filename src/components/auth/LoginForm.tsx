import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  error?: string | null;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="correo@ejemplo.com"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Ingrese su contraseña"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 ...">
        Acceder
      </Button>
    </form>
  );
}