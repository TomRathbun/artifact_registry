# Contributing to the Artifact Registry

Thank you for your interest in contributing to the Artifact Registry! We welcome improvements to the traceability engine, visualization tools, and architectural models.

## 🛠 Development Workflow

1. **Fork the Repository**: Create your own fork of the project.
2. **Setup Your Environment**: Follow the instructions in [INSTALL.md](INSTALL.md).
3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
4. **Implementation & Testing**:
   - Ensure you follow the project's styling guidelines (Tailwind for frontend).
   - Verify that your data models match the SQLAlchemy schema.
   - Run tests (if applicable) before submitting.
5. **Commit Your Changes**:
   - Use descriptive commit messages.
   - Mention any related artifacts or requirements.
6. **Submit a Pull Request**: Provide a clear summary of your changes and why they are needed.

## 📜 Coding Standards

- **Python**: Follow PEP 8. Use type hints for all FastAPI endpoints.
- **Frontend**: Use TypeScript for all new components. Prefer functional components with hooks.
- **Documentation**: Keep `README.md` and `USERS_GUIDE.md` up to date with UI changes.

## 🐞 Bug Reports

Please use the issue tracker to report bugs. Include:
- Steps to reproduce the issue.
- Expected behavior vs. actual behavior.
- Browser and OS version (for frontend issues).

---
*Developed by the SECL MBSE Team.*
