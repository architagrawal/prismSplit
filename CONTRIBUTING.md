# Contributing to PrismSplit

Thank you for your interest in contributing to PrismSplit! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and collaborative. We're building this together!

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Device/platform information

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with:
   - Clear description of the feature
   - Use cases
   - Why it would be valuable
   - Optional: mockups or examples

### Contributing Code

#### 1. Fork and Clone

```bash
git clone https://github.com/your-username/prismsplit.git
cd prismsplit
```

#### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

#### 3. Make Changes

- Follow existing code style
- Write meaningful commit messages
- Keep commits focused and atomic
- Test on iOS, Android, and Web

#### 4. Commit

```bash
git add .
git commit -m "feat: add bill splitting by percentage"
```

Commit message format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

#### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- Clear description of changes
- Reference to related issues
- Screenshots/videos of UI changes
- Testing notes

### Code Style

#### TypeScript

- Use TypeScript for all new files
- Define types for all props and state
- Avoid `any` type
- Use interfaces for object shapes

#### React Native/Expo

- Use functional components with hooks
- Use Tamagui components instead of React Native primitives
- Keep components small and focused
- Extract reusable logic into custom hooks

#### File Organization

- Place components in appropriate feature folders
- Co-locate related files
- Use barrel exports (`index.ts`) for cleaner imports

#### Naming

- Components: `PascalCase`
- Files: `PascalCase.tsx` for components
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`

### Testing

- Test all user flows manually
- Test on iOS, Android, and Web
- Verify TypeScript types compile
- Check for console errors/warnings

### Pull Request Guidelines

✅ **Do:**

- Keep PRs focused on a single feature/fix
- Write clear PR descriptions
- Reference related issues
- Update documentation if needed
- Test thoroughly before submitting
- Respond to review comments promptly

❌ **Don't:**

- Submit PRs with unrelated changes
- Break existing functionality
- Ignore failing tests
- Force push after review starts
- Submit work-in-progress without marking as draft

## Development Setup

See `docs/onboarding/getting-started.md` for detailed setup instructions.

## Project Structure

See `docs/architecture/folder-structure.md` for organization guidelines.

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an issue
- **Chat**: [Add team communication channel]

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to PrismSplit! 🎉
