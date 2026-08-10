# Security Policy

## Reporting a Vulnerability

🔒 **Do not open a public issue for security vulnerabilities.**

If you discover a security vulnerability in kra-secure, please report it responsibly by emailing:
- **kraaxiom@gmail.com** with subject: `[SECURITY] kra-secure vulnerability`

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

We will:
1. Acknowledge your report within 48 hours
2. Work on a fix and security patch
3. Credit you in the security advisory (optional)
4. Publish a security update

## Supported Versions

| Version | Status | Support Until |
|---------|--------|----------------|
| 2.x     | ✅ Supported | Current + 1 year |
| 1.x     | ⚠️ Limited | Bug fixes only |
| < 1.0   | ❌ End of Life | No support |

## Security Best Practices

When using kra-secure:

1. **Always use `high` protection level** for sensitive code
2. **Enable anti-tampering** in production (`antiTampering.enabled: true`)
3. **Sign your builds** with SHA-512 for critical deployments
4. **Verify signatures in CI/CD** before deployment
5. **Keep kra-secure updated** to the latest version
6. **Never commit source files to production** - only deploy `dist/`
7. **Use strong algorithms** - prefer `sha512` over `sha256`

## Known Issues & Mitigations

### Issue: Console-based debugging
**Mitigation:** Use `level: "high"` which enables console blocking

### Issue: Chrome DevTools inspection
**Mitigation:** Enable `debugProtection: true` in options

### Issue: Code analysis via source maps
**Mitigation:** Never commit or serve `.js.map` files in production

## Security Testing

We use automated security scanning:
- `npm audit` for dependency vulnerabilities
- SAST tools for code analysis
- Regular penetration testing of the core obfuscation engine

To run security checks locally:

```bash
npm audit
npm audit fix
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [JavaScript Obfuscation Best Practices](https://www.npmjs.com/package/javascript-obfuscator)

---

**Thank you for keeping kra-secure secure! 🔐**
