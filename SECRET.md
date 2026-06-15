# Secrets Policy

- Never commit `.env` files to Git.
- Never paste a Consumer Secret in AI prompts, Discord, or screenshots.
- Rotate credentials immediately if exposure is suspected.
- Store secrets only in environment variables.
- Use pre-commit hooks to detect common secret patterns.
- Every environment variable has a documented counterpart in `.env.example`.
- Review pull requests for accidental credential exposure.
- Run secret scanning tools before major releases.
- Remove unused credentials and API keys regularly.
- Follow the principle of least privilege when creating credentials.
