@echo off
echo 🔍 Verificando archivos de base de datos antes del commit...

REM Verificar archivos de base de datos en staging
git diff --cached --name-only | findstr /i "\.db$" >nul
if %errorlevel% equ 0 (
    echo ❌ ERROR: Se encontraron archivos de base de datos en staging area
    echo 🚨 NUNCA subas archivos de base de datos a GitHub o Render
    echo.
    echo Archivos encontrados:
    git diff --cached --name-only | findstr /i "\.db$"
    echo.
    echo Para solucionarlo:
    echo   git reset HEAD <archivo>
    echo   echo "archivo" >> .gitignore
    exit /b 1
)

REM Verificar archivos de base de datos modificados
git diff --name-only | findstr /i "\.db$" >nul
if %errorlevel% equ 0 (
    echo ❌ ERROR: Se encontraron archivos de base de datos modificados
    echo 🚨 NUNCA subas archivos de base de datos a GitHub o Render
    echo.
    echo Archivos encontrados:
    git diff --name-only | findstr /i "\.db$"
    echo.
    echo Para solucionarlo:
    echo   git restore <archivo>
    echo   echo "archivo" >> .gitignore
    exit /b 1
)

echo ✅ OK: No se encontraron archivos de base de datos
echo ✅ El commit es seguro
exit /b 0
