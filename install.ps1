# install.ps1
# Run with: powershell -ExecutionPolicy Bypass -File install.ps1

Set-StrictMode -Version Latest

# Initialize npm if package.json is missing
if (-not (Test-Path -Path "./package.json")) {
    Write-Host "Initializing npm..."
    npm init -y
}

Write-Host "Installing runtime dependencies..."
npm install react@19.0.0 react-dom@19.0.0 next@15.1.6 @supabase/supabase-js@^2.97.0 `
  @tiptap/react@2.11.2 @tiptap/starter-kit@2.11.2 @tiptap/extension-image@2.11.2 @tiptap/pm@2.11.2 `
  react-pdf@^10.4.0 pdfjs-dist@3.11.174 react-pageflip@^2.0.3 lucide-react@^0.474.0 buffer@6.0.3

Write-Host "Installing devDependencies..."
npm install -D typescript@^5 @types/node@^20 @types/react@^19 @types/react-dom@^19 `
  eslint@^9 eslint-config-next@15.1.6 postcss@^8.5.6 tailwindcss@^4.2.0 `
  @tailwindcss/postcss@^4.2.0 @tailwindcss/typography@^0.5.19

Write-Host "Install complete. You can run 'npm run dev' to start the dev server."
