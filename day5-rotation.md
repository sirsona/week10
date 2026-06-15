A fake secret was intentionally committed to the `feature/fake-leak` branch to simulate a credential leak.

The file was later removed, but deleting the file does not remove the secret from Git history.

Any with access to the repository history can still retrieve the leaked value from older commits.

If the secret was real, the correct response would be to immediately rotate or revoke the credential in the service provider's dashboard.
