"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { login, saveTokens } from "@/lib/auth";
import { Loader2, AlertCircle, FileText } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return false;
    }
    if (!password) {
      setError("Por favor, ingresa tu contraseña");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email, password);

      // Save tokens
      saveTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });

      // Success - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("[v0] Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión. Por favor, verifica tus credenciales."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-8 text-center">
        {/* Logo */}
        <div className="mb-2 flex justify-center">
          <div className="from-primary to-accent flex items-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2">
            <FileText className="text-primary-foreground h-8 w-8" />
            <span className="text-primary-foreground text-2xl font-bold">
              TributariApp
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-balance">
            Bienvenido de nuevo
          </CardTitle>
          <CardDescription className="text-base text-pretty">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              className="animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="focus:ring-primary/20 h-11 transition-all duration-200 focus:ring-2"
              autoComplete="email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="focus:ring-primary/20 h-11 transition-all duration-200 focus:ring-2"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked: boolean | "indeterminate") =>
                  setRememberMe(checked === true)
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="remember"
                className="cursor-pointer text-sm font-normal select-none"
              >
                Recordarme
              </Label>
            </div>
            <a
              href="/recuperar-contrasena"
              className="text-primary hover:text-accent text-sm font-medium transition-colors duration-200"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="from-primary to-accent h-11 w-full bg-gradient-to-r text-base font-semibold shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          {/* Sign Up Link */}
          <div className="text-muted-foreground text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <a
              href="/registro"
              className="text-primary hover:text-accent font-medium transition-colors duration-200"
            >
              Regístrate aquí
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
