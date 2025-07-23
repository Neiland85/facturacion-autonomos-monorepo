# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it by emailing the project maintainers. Do not create a public issue.

## Security Measures

### Environment Variables
- All sensitive credentials must use environment variable references: `${VAR:-default}`
- Never commit actual passwords or API keys to version control
- Use secure defaults that don't expose real credentials

### Database Security
- Database passwords are configured via environment variables
- Default values in `.env.example` are placeholders only
- Production credentials must be set in secure deployment environments

### Kubernetes Security
- Service accounts follow principle of least privilege
- Security contexts enable non-root execution
- Read-only filesystem where possible
- All capabilities dropped by default

## Security Checklist

Before deploying:
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly configured
- [ ] Kubernetes RBAC applied
- [ ] Security contexts configured
- [ ] Dependencies updated to latest secure versions

## Dependencies

We regularly update dependencies to ensure security patches are applied promptly.
