# Radical UI AI Studio Kit

This kit contains everything you need to build "Radical" Frappe-compatible apps directly in AI Studio.

## 📦 What's Included?
- `/ui`: Core Neobrutalism components (Buttons, Cards, Modals, 3D Effects).
- `/radical`: Special CRM components (Ghost Actions, Trust Batteries, Liquid Dashboard).
- `/hooks`: Mocked Frappe hooks for data fetching.
- `/types`: CRM Lead and Deal types for Auto-completion.
- `/lib`: Design tokens and CSS utilities.

## 🚀 How to use in AI Studio
1. **Upload**: Upload this entire directory structure to your AI Studio project.
2. **Setup**: In your `index.tsx`, wrap your App with the `RadicalMockProvider`.

```tsx
import { RadicalMockProvider } from './radical-kit/MockProvider';

function App() {
  return (
    <RadicalMockProvider>
      <LiquidDashboard />
    </RadicalMockProvider>
  );
}
```

3. **Importing Components**:
```tsx
import { Button } from './radical-kit/ui/Button';
import { GhostActionButtons } from './radical-kit/radical/GhostActions';
```

4. **Data Fetching**:
Use `useFrappeList` exactly as you would in the real CRM. High-fidelity mock data is returned automatically in the AI Studio preview.

## 🤖 AI Studio Prompts
Use these prompts to guide the AI Studio agent in expanding your Radical collection:
1. **[Prompt 1: Sweep & Identify](./prompts/prompt1_sweep_and_identify.md)**: Use this to audit your codebase and find Radical opportunities.
2. **[Prompt 2: Convert & Implement](./prompts/prompt2_convert_and_implement.md)**: Use this to perform the actual refactoring and implementation of Radical components.

## 🎨 Styling
Ensure you have the following in your `index.html` or global CSS:
- Tailwind CSS (v4 recommended)
- Google Font: Inter or Outfit
- The kit includes a `globals.css` style shim for Vantablack themes.

---
Built for Robin's Radical CRM.
