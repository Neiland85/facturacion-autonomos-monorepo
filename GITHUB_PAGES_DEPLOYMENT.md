# 🐙 GITHUB PAGES DEPLOYMENT

## 📋 GitHub Actions Workflow:

### `.github/workflows/deploy.yml`:
```yaml
name: Deploy Next.js App

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: cd apps/web && npm install --legacy-peer-deps
      
    - name: Build
      run: cd apps/web && npm run build
      
    - name: Export
      run: cd apps/web && npm run export  # Si usas static export
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: apps/web/out
```

### ✅ **Ventajas:**
- ✅ Totalmente gratis
- ✅ Control completo del build
- ✅ No problemas con monorepos
