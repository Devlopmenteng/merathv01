#!/bin/bash
set -e

echo "🔧 Starting final automation for remaining manual tasks"

# ============================================================
# 1. Replace hardcoded strings with t('key') in screens/components
# ============================================================
echo "Replacing hardcoded English strings with t() keys..."

# Define replacements (key -> display text in en.json)
# We'll first add keys to en.json, then replace in files.
# Use a temporary file for en.json updates.

# Add new translation keys to en.json (if not already present)
EN_JSON="lib/i18n/locales/en.json"

# Create a backup
cp $EN_JSON ${EN_JSON}.bak

# Add missing keys using jq (if available) or manual merge
if command -v jq &> /dev/null; then
    NEW_KEYS=$(cat <<EOF
{
  "estateDetails": "Estate Details",
  "totalEstate": "Total Estate ($)",
  "funeralCosts": "Funeral Costs",
  "debts": "Debts",
  "will": "Will (optional)",
  "nextSelectSchool": "Next: Select School",
  "selectHeirs": "Select Heirs",
  "calculateInheritance": "Calculate Inheritance",
  "netEstate": "Net Estate",
  "confidence": "Confidence",
  "fractions": "Fractions",
  "percentages": "Percentages",
  "distribution": "Distribution",
  "steps": "Calculation Steps",
  "compare": "Compare",
  "history": "History",
  "settings": "Settings",
  "copy": "Copy",
  "pdf": "PDF",
  "share": "Share",
  "deepLinkCopied": "Deep link copied to clipboard",
  "madhabSelect": "Select School of Thought",
  "hanafi": "Hanafi",
  "maliki": "Maliki",
  "shafii": "Shafi'i",
  "hanbali": "Hanbali",
  "quickTemplates": "Quick Start Templates",
  "spouse": "Spouse",
  "children": "Children",
  "parentsGrandparents": "Parents & Grandparents",
  "siblings": "Siblings",
  "extended": "Extended",
  "amount": "Amount",
  "share": "Share",
  "pdfReport": "PDF Report",
  "shareImage": "Share Image",
  "darkMode": "Dark Mode",
  "about": "About",
  "version": "Version",
  "calculationsPerformed": "Calculations performed",
  "premium": "Premium",
  "unlockLegalReports": "Unlock legal reports & fiqh notes"
}
EOF
)
    # Merge new keys into en.json
    jq --slurpfile new <(echo "$NEW_KEYS") '. + $new[0]' $EN_JSON > ${EN_JSON}.tmp && mv ${EN_JSON}.tmp $EN_JSON
else
    echo "⚠️ jq not installed; skipping auto-merge of translation keys. Please manually add keys from the plan."
fi

# Replace strings in .tsx files (screens and components)
# This is a best-effort replacement; review after.
find screens components -name "*.tsx" -type f -exec sed -i \
    -e 's/Estate Details/{t("estateDetails")}/g' \
    -e 's/Total Estate (\$)/{t("totalEstate")}/g' \
    -e 's/Funeral Costs/{t("funeralCosts")}/g' \
    -e 's/Debts/{t("debts")}/g' \
    -e 's/Will (optional)/{t("will")}/g' \
    -e 's/Next: Select School/{t("nextSelectSchool")}/g' \
    -e 's/Select Heirs/{t("selectHeirs")}/g' \
    -e 's/Calculate Inheritance/{t("calculateInheritance")}/g' \
    -e 's/Net Estate/{t("netEstate")}/g' \
    -e 's/Confidence/{t("confidence")}/g' \
    -e 's/Fractions/{t("fractions")}/g' \
    -e 's/Percentages/{t("percentages")}/g' \
    -e 's/Distribution/{t("distribution")}/g' \
    -e 's/Calculation Steps/{t("steps")}/g' \
    -e 's/Compare/{t("compare")}/g' \
    -e 's/History/{t("history")}/g' \
    -e 's/Settings/{t("settings")}/g' \
    -e 's/Copy/{t("copy")}/g' \
    -e 's/PDF/{t("pdf")}/g' \
    -e 's/Share/{t("share")}/g' \
    -e 's/Deep link copied to clipboard/{t("deepLinkCopied")}/g' \
    -e 's/Select School of Thought/{t("madhabSelect")}/g' \
    -e 's/Hanafi/{t("hanafi")}/g' \
    -e 's/Maliki/{t("maliki")}/g' \
    -e 's/Shafi'\''i/{t("shafii")}/g' \
    -e 's/Hanbali/{t("hanbali")}/g' \
    -e 's/Quick Start Templates/{t("quickTemplates")}/g' \
    -e 's/Spouse/{t("spouse")}/g' \
    -e 's/Children/{t("children")}/g' \
    -e 's/Parents & Grandparents/{t("parentsGrandparents")}/g' \
    -e 's/Siblings/{t("siblings")}/g' \
    -e 's/Extended/{t("extended")}/g' \
    -e 's/Amount/{t("amount")}/g' \
    -e 's/Share/{t("share")}/g' \
    -e 's/PDF Report/{t("pdfReport")}/g' \
    -e 's/Share Image/{t("shareImage")}/g' \
    -e 's/Dark Mode/{t("darkMode")}/g' \
    -e 's/About/{t("about")}/g' \
    -e 's/Version/{t("version")}/g' \
    -e 's/Calculations performed/{t("calculationsPerformed")}/g' \
    -e 's/Premium/{t("premium")}/g' \
    -e 's/Unlock legal reports & fiqh notes/{t("unlockLegalReports")}/g' \
    {} \;

# Also ensure t is imported where used (add import if missing)
find screens components -name "*.tsx" -exec grep -l "t(" {} \; | while read file; do
    if ! grep -q "import { t } from '.*i18n'" "$file"; then
        sed -i "1i import { t } from '../lib/i18n';" "$file"
    fi
done

# ============================================================
# 2. Translate ur.json and ms.json (placeholder - manual)
# ============================================================
echo "Preparing translation files for Urdu and Malay..."
# Copy English to Urdu and Malay with a comment that they need translation
for lang in ur ms; do
    cp lib/i18n/locales/en.json lib/i18n/locales/${lang}.json
    # Add a comment at the top as JSON doesn't support comments. Instead, add a dummy key.
    sed -i '1s/^{/{\n  "_comment": "TODO: Translate this file to '$lang'",/' lib/i18n/locales/${lang}.json
done
echo "⚠️ Please manually translate lib/i18n/locales/ur.json and ms.json using a translation service."

# ============================================================
# 3. Implement deep-link navigation fully in App.tsx
# ============================================================
echo "Implementing deep-link navigation..."
cat > /tmp/deep_link_patch.js << 'EOF'
// This is a patch to be applied to App.tsx.
// It adds a complete deep-link handler that updates CalcContext.
// We'll use sed to insert the full implementation.

EOF

# Directly modify App.tsx - replace the skeleton with full implementation
sed -i '/useEffect(() => {/,/}, \[\]);/c\
  useEffect(() => {\
    const handleDeepLink = async (event) => {\
      const url = event.url;\
      if (!url) return;\
      const query = url.split("?")[1];\
      if (!query) return;\
      const params = new URLSearchParams(query);\
      const total = parseFloat(params.get("total") || "0");\
      const funeral = parseFloat(params.get("funeral") || "0");\
      const debts = parseFloat(params.get("debts") || "0");\
      const will = parseFloat(params.get("will") || "0");\
      const madhab = params.get("madhab");\
      const heirs = {};\
      for (let [key, value] of params.entries()) {\
        if (["total","funeral","debts","will","madhab"].includes(key)) continue;\
        heirs[key] = parseInt(value, 10);\
      }\
      if (total > 0) dispatch({ type: "SET_ESTATE", payload: { total, funeral, debts, will } });\
      if (madhab && ["hanafi","maliki","shafii","hanbali"].includes(madhab)) dispatch({ type: "SET_MADHAB", payload: madhab });\
      if (Object.keys(heirs).length > 0) dispatch({ type: "SET_HEIRS", payload: heirs });\
    };\
    const subscription = Linking.addEventListener("url", handleDeepLink);\
    return () => subscription.remove();\
  }, [dispatch]);' App.tsx

# Ensure dispatch is available (already in CalcContext)
echo "✅ Deep-link navigation implemented."

# ============================================================
# 4. Add real loading skeletons (replace text placeholder)
# ============================================================
echo "Adding real loading skeletons..."

# Create a SkeletonLoader component if not exists
cat > components/ui/SkeletonLoader.tsx << 'SKEL_EOF'
import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type SkeletonLoaderProps = {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ width = '100%', height = 20, style }) => {
  const theme = useAppTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const bg = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.surfaceVariant, theme.colors.surface],
  });

  return <Animated.View style={[{ width, height, borderRadius: theme.radius.sm, backgroundColor: bg }, style]} />;
};
SKEL_EOF

# Update HeirSelector to use SkeletonLoader instead of text
sed -i '/loadingTemplates && <Text>Loading templates...<\/Text>/c\
      {loadingTemplates && <SkeletonLoader width="100%" height={40} style={{ marginVertical: 8 }} />}' components/HeirSelector.tsx

# Add import for SkeletonLoader
sed -i '/import { useAppTheme }/a import { SkeletonLoader } from "../components/ui/SkeletonLoader";' components/HeirSelector.tsx

# ============================================================
# 5. Improve currency formatting (replace $ with Intl.NumberFormat)
# ============================================================
echo "Improving currency formatting..."

# Create a currency helper
cat > lib/utils/currency.ts << 'CURR_EOF'
export const formatCurrency = (amount: number, locale: string = 'en-US', currency: string = 'USD'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
};
CURR_EOF

# Replace $...toFixed(2) with formatCurrency in Results.tsx and other screens
find screens components -name "*.tsx" -exec sed -i \
    -e 's/\$\([0-9.]*\)\.toFixed(2)/formatCurrency(\1, getLocales()[0]?.languageCode, "USD")/g' \
    -e 's/\$\([0-9.]*\)/formatCurrency(\1)/g' {} \;

# Add import for formatCurrency and getLocales where used
find screens components -name "*.tsx" -exec grep -l "formatCurrency" {} \; | while read file; do
    if ! grep -q "import { formatCurrency }" "$file"; then
        sed -i "1i import { formatCurrency } from '../lib/utils/currency';\nimport { getLocales } from 'expo-localization';" "$file"
    fi
done

echo "✅ Currency formatting updated."

# ============================================================
# 6. Final message
# ============================================================
echo ""
echo "🎉 Automation completed!"
echo "⚠️ Manual steps remaining:"
echo "   - Translate lib/i18n/locales/ur.json and ms.json (use Google Translate or a translator)."
echo "   - Test RTL by switching your device language to Arabic and verifying layout."
echo "   - Run 'npm test' to ensure no regressions."
echo "   - Start the app with 'npx expo start --clear' and test deep links (e.g., merath://setup?total=100000&madhab=hanafi&son=2)."
echo ""
echo "✅ All code changes applied. Please review and commit."