# Contributing to kra-secure

Thank you for your interest in contributing! We welcome all contributions, from bug reports to feature requests and code improvements.

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- Git

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/kraaxiom/kra-secure.git
cd kra-secure

# Install dependencies
npm install

# Build the project
npm run build

# Run tests (if available)
npm test

# Watch mode for development
npm run watch
```

## 📝 How to Contribute

### Report a Bug 🐛

1. Check existing [issues](https://github.com/kraaxiom/kra-secure/issues) first
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node.js version)
   - Code snippet if relevant

### Suggest a Feature 💡

1. Open a [discussion](https://github.com/kraaxiom/kra-secure/discussions) or issue
2. Describe the use case and expected behavior
3. Wait for feedback before implementing

### Submit Code Changes 🔧

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our code style
4. Test your changes thoroughly
5. Commit with clear messages: `git commit -m "feat: add feature X"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request with:
   - Clear description of changes
   - Reference to related issue
   - Any breaking changes noted

## 📋 Code Style

- Use **ES6+** syntax
- Follow **2-space indentation**
- Use **meaningful variable names**
- Add comments for complex logic
- Write **JSDoc comments** for functions

### Example

```javascript
/**
 * Obfuscates JavaScript code with the specified protection level
 * @param {string} code - The source code to obfuscate
 * @param {object} options - Configuration options
 * @param {string} options.level - Protection level: 'low', 'medium', 'high'
 * @returns {Promise<string>} The obfuscated code
 */
async function obfuscate(code, options = {}) {
  // Implementation
}
```

## ✅ Testing

Please ensure all tests pass before submitting a PR:

```bash
npm test
```

## 📚 Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     A new feature
fix:      A bug fix
docs:     Documentation changes
refactor: Code refactoring without feature changes
perf:     Performance improvements
test:     Adding or updating tests
chore:    Maintenance or tooling changes
```

Example: `feat: add support for custom obfuscation presets`

## 🎯 Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Update CHANGELOG.md
4. Ensure CI/CD passes
5. Request review from maintainers
6. Respond to feedback promptly

## 📞 Questions?

- Check [discussions](https://github.com/kraaxiom/kra-secure/discussions)
- Review [documentation](https://github.com/kraaxiom/kra-secure#documentation)
- Open an issue for clarification

## 📜 Code of Conduct

Be respectful and professional in all interactions. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

---

**Thank you for helping make kra-secure better! 🙏**
