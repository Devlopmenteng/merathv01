#!/bin/bash
echo "=== Checking TypeScript config ==="
cat tsconfig.json

echo -e "\n=== Checking app.json (Expo config) ==="
cat app.json

echo -e "\n=== Checking app.config.ts (if exists) ==="
cat app.config.ts 2>/dev/null || echo "app.config.ts not found"

echo -e "\n=== Checking eas.json ==="
cat eas.json

echo -e "\n=== Checking package.json scripts ==="
grep -A 5 '"scripts"' package.json

echo -e "\n=== Checking EAS project ID consistency ==="
grep -r "9fce94bd-7eee-4453-9707-f4bcc74246f6" . --include="*.json" --include="*.ts" 2>/dev/null || echo "Project ID not found in any config file (may be stored remotely)"
