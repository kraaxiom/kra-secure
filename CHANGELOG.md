# Changelog

All notable changes to kra-secure are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.3] - 2026-08-10

### Added
- ✨ Premium README with improved documentation
- 🤝 CONTRIBUTING.md guide for open source contributors
- 🔐 SECURITY.md policy for vulnerability reporting
- 📚 Enhanced inline code documentation
- 🎯 Roadmap and use cases documentation

### Improved
- 📖 Better organized documentation structure
- 🎨 Enhanced visual presentation with badges and emojis
- 🔗 Added comparison table with alternative tools
- 💡 More examples and use cases

### Fixed
- Various documentation typos and clarity issues

## [2.0.2] - 2026-06-12

### Added
- SHA-512 algorithm support for anti-tampering
- Multi-file build support with `[name]` pattern
- Watch mode lifecycle hooks (onStart, onFileChange, etc.)

### Improved
- Performance optimizations for large projects
- Better error messages and debugging info
- Improved config file validation

### Fixed
- Watch mode not detecting all file changes
- Config deep-merge issues with arrays
- Race condition in concurrent builds

## [2.0.1] - 2026-05-15

### Added
- Debug mode with source maps
- Protection level presets (low, medium, high)
- CLI argument validation

### Improved
- Reduced bundle size by 15%
- Faster obfuscation for medium-sized files
- Better Windows compatibility

### Fixed
- Config file not loading from custom paths
- Build failing on Windows with special characters
- Memory leak in watch mode

## [2.0.0] - 2026-04-01

### Added
- Complete rewrite with esbuild integration
- Three protection levels (low, medium, high)
- Anti-tampering with SHA-256/512 signing
- Watch mode with file monitoring
- Programmatic API with EventEmitter support
- Configuration file support (kra-secure.config.js)
- CLI and programmatic interfaces

### Changed
- **BREAKING:** API completely redesigned
- **BREAKING:** Config file format changed
- **BREAKING:** CLI commands reorganized

### Removed
- Legacy webpack plugin support
- Old configuration format

## [1.0.0] - 2026-01-15

### Added
- Initial release
- Basic obfuscation functionality
- Simple CLI interface
- Configuration support

---

## Planned Features

### v2.1 - Configuration Presets
- [ ] Pre-built configurations for SPA, API, Electron, etc.
- [ ] One-click protection profiles

### v2.2 - Windows & GUI
- [ ] Standalone Windows .exe CLI
- [ ] Graphical user interface for configuration

### v2.3 - Platform Support
- [ ] PHP integration & Composer package
- [ ] Apache/Nginx configuration helpers
- [ ] Server-side obfuscation examples

### v3.0 - Advanced Features
- [ ] Usage analytics and insights
- [ ] Performance profiling
- [ ] Advanced obfuscation metrics

---

## Version Support Policy

- **Current (2.x):** Full support, new features, security updates
- **Previous (1.x):** Bug fixes only, no new features
- **Older:** No support, users encouraged to upgrade

---

**For upgrade guidance, see: [Migration Guide](docs/MIGRATION.md)**

**Report issues: [GitHub Issues](https://github.com/kraaxiom/kra-secure/issues)**
