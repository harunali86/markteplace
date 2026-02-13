# Contributing to Doossh Marketplace

Welcome! We're glad you're here. This document provides guidelines for contributing to the Doossh Marketplace monorepo.

## Project Structure

This is a **Turbo Monorepo** setup:
- `apps/web`: The main Next.js application (Marketplace).
- `packages/ui`: Shared UI component library.
- `packages/db`: Database schema, migrations, and seeding scripts.
- `packages/eslint-config`: Shared linting configurations.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Development:**
   ```bash
   npm run dev
   ```

3. **Build:**
   ```bash
   npm run build
   ```

## Coding Standards

- **Next.js 15+:** Always `await params` in dynamic routes.
- **Components:** Use the shared `@doossh/ui` components whenever possible.
- **Styles:** Use Tailwind CSS for all styling.

## Pull Requests

1. Create a new branch: `git checkout -b feature/your-feature-name`.
2. Make your changes and commit: `git commit -m "feat: your feature description"`.
3. Push to GitHub: `git push -u origin feature/your-feature-name`.
4. Open a Pull Request on GitHub. CodeRabbit will automatically review your changes.

Thanks for contributing! 🚀🎯
