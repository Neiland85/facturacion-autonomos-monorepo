"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

type AppTheme = "default" | "sage" | "terracotta"

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [selectedAppTheme, setSelectedAppTheme] = useState<AppTheme>("default")
  const [enablePaperTexture, setEnablePaperTexture] = useState(false)

  useEffect(() => {
    // Read initial app theme from localStorage
    const storedAppTheme = localStorage.getItem("app-theme") as AppTheme
    if (storedAppTheme) {
      setSelectedAppTheme(storedAppTheme)
      document.body.classList.add(`theme-${storedAppTheme}`)
    } else {
      document.body.classList.add("theme-default")
    }

    // Read initial texture setting from localStorage
    const storedTexture = localStorage.getItem("app-texture") === "true"
    setEnablePaperTexture(storedTexture)
    if (storedTexture) {
      document.body.classList.add("bg-paper-texture")
    }
  }, [])

  const handleAppThemeChange = (newTheme: AppTheme) => {
    setSelectedAppTheme(newTheme)
    localStorage.setItem("app-theme", newTheme)
    // Remove previous theme classes and add the new one
    document.body.classList.remove("theme-default", "theme-sage", "theme-terracotta")
    document.body.classList.add(`theme-${newTheme}`)
  }

  const handleTextureToggle = (checked: boolean) => {
    setEnablePaperTexture(checked)
    localStorage.setItem("app-texture", String(checked))
    if (checked) {
      document.body.classList.add("bg-paper-texture")
    } else {
      document.body.classList.remove("bg-paper-texture")
    }
  }

  return (
    <Card className="shadow-soft bg-white/80 dark:bg-slate-800/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
        <CardDescription>Personaliza el esquema de colores y la textura de la aplicación.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dark/Light Mode */}
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode-switch" className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Modo Oscuro
          </Label>
          <Switch
            id="dark-mode-switch"
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>

        {/* Application Theme */}
        <div>
          <Label className="mb-2 block">Esquema de Colores</Label>
          <RadioGroup
            value={selectedAppTheme}
            onValueChange={handleAppThemeChange}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="flex flex-col items-center space-y-2">
              <RadioGroupItem value="default" id="theme-default" className="sr-only" />
              <Label
                htmlFor="theme-default"
                className={cn(
                  "w-full h-20 rounded-lg border-2 cursor-pointer flex items-center justify-center text-sm font-medium transition-all hover:border-primary",
                  selectedAppTheme === "default" ? "border-primary ring-2 ring-primary" : "border-border",
                  "bg-gradient-to-br from-petrol to-petrol-light dark:from-petrol-dark dark:to-petrol",
                )}
              >
                <span className="text-white dark:text-gray-200">Default</span>
              </Label>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <RadioGroupItem value="sage" id="theme-sage" className="sr-only" />
              <Label
                htmlFor="theme-sage"
                className={cn(
                  "w-full h-20 rounded-lg border-2 cursor-pointer flex items-center justify-center text-sm font-medium transition-all hover:border-sage-500",
                  selectedAppTheme === "sage" ? "border-sage-500 ring-2 ring-sage-500" : "border-border",
                  "bg-gradient-to-br from-sage-500 to-sage-600 dark:from-sage-700 dark:to-sage-800",
                )}
              >
                <span className="text-white dark:text-sage-100">Sage</span>
              </Label>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <RadioGroupItem value="terracotta" id="theme-terracotta" className="sr-only" />
              <Label
                htmlFor="theme-terracotta"
                className={cn(
                  "w-full h-20 rounded-lg border-2 cursor-pointer flex items-center justify-center text-sm font-medium transition-all hover:border-terracotta-500",
                  selectedAppTheme === "terracotta"
                    ? "border-terracotta-500 ring-2 ring-terracotta-500"
                    : "border-border",
                  "bg-gradient-to-br from-terracotta-500 to-terracotta-600 dark:from-terracotta-700 dark:to-terracotta-800",
                )}
              >
                <span className="text-white dark:text-terracotta-100">Terracotta</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Paper Texture */}
        <div className="flex items-center justify-between">
          <Label htmlFor="paper-texture-switch">Fondo con Textura de Papel</Label>
          <Switch id="paper-texture-switch" checked={enablePaperTexture} onCheckedChange={handleTextureToggle} />
        </div>
      </CardContent>
    </Card>
  )
}
