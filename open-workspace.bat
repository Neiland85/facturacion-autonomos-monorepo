@echo off
:: 🚀 Script para abrir el workspace aislado de VS Code en Windows
:: Uso: open-workspace.bat

setlocal EnableDelayedExpansion

:: Banner
echo.
echo 🏢 =====================================
echo    FACTURACIÓN AUTÓNOMOS WORKSPACE
echo    Configuración Aislada de VS Code
echo =====================================
echo.

:: Verificar que estamos en el directorio correcto
if not exist "facturacion-autonomos.code-workspace" (
    echo ❌ Error: No se encontró el archivo workspace.
    echo 💡 Asegúrate de ejecutar este script desde el directorio raíz del proyecto.
    pause
    exit /b 1
)

:: Verificar que VS Code esté instalado
where code >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ Error: VS Code no está instalado o no está en el PATH.
    echo 💡 Instala VS Code y asegúrate de que el comando 'code' esté disponible.
    pause
    exit /b 1
)

echo ✅ Archivo workspace encontrado
echo ✅ VS Code detectado
echo.

:: Mostrar información del workspace
echo 📦 Información del Workspace:
echo    📁 Archivo: facturacion-autonomos.code-workspace
echo    🎯 Proyecto: Facturación Autónomos Monorepo
echo    🛠️  Tecnologías: TurboRepo, Next.js, Express, Prisma
echo.

:: Preguntar al usuario si quiere continuar
set /p "confirm=¿Deseas abrir el workspace aislado? [Y/n]: "
if /i "!confirm!"=="n" (
    echo ❌ Operación cancelada por el usuario.
    pause
    exit /b 0
)

:: Abrir VS Code con el workspace
echo 🚀 Abriendo workspace aislado...
code facturacion-autonomos.code-workspace

echo.
echo ✅ Workspace abierto exitosamente!
echo.
echo 📋 Próximos pasos:
echo    1. 🧩 VS Code instalará las extensiones recomendadas
echo    2. ⚙️  Se aplicarán las configuraciones específicas
echo    3. 🔧 Estarán disponibles las tasks predefinidas
echo    4. 🐛 Podrás usar las debug configurations
echo.
echo 💡 Tip: Usa Ctrl+Shift+P → 'Tasks: Run Task' para ver todas las tareas disponibles
echo 💡 Tip: Ve a la pestaña Debug (F5) para usar las configuraciones de debug
echo.
echo 📚 Documentación:
echo    📖 README.md - Guía principal
echo    📖 docs/WORKSPACE_AISLADO.md - Guía del workspace
echo    📖 docs/ESTADO_FINAL.md - Estado del proyecto
echo.
pause
