import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  formData: { username: string; password: string };
  onChange: (field: string, value: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
}

export function LoginForm({ formData, onChange, onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-white">Usuario</Label>
        <Input
          id="username"
          type="text"
          placeholder="Ingrese su usuario"
          value={formData.username}
          onChange={(e) => onChange("username", e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="Ingrese su contraseña"
          value={formData.password}
          onChange={(e) => onChange("password", e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
          required
        />
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg shadow-lg shadow-purple-500/50">
        Acceder
      </Button>
    </form>
  );
}