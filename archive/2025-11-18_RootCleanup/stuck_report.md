# Playwright Web Server Startup Failures

## Summary
While running `npx playwright test tests/styleguide.spec.ts`, the embedded Playwright `webServer` never reached the ready state. After the 180 s timeout, Playwright halted with:

```
Error: Timed out waiting 180000ms from config.webServer.
```

This occurs consistently even after terminating prior runs.

## Evidence
- Playwright output shows `{command: "npm run build && NEXT_DISABLE_MIDDLEWARE=1 HOSTNAME=127.0.0.1 PORT=3100 npm run start"}` never signals readiness.
- Manual start attempt:
  ```sh
  NEXT_DISABLE_MIDDLEWARE=1 HOSTNAME=127.0.0.1 PORT=3100 npm run start
  ```
  returns immediately with:
  ```
  Error: listen EADDRINUSE: address already in use 127.0.0.1:3100
  ```
- `lsof -nP | grep 3100` shows an existing Node process listening on port 3100 (e.g., PID 31220). Killing the PID allows the server to start.

## Root Cause
Multiple Playwright runs leave the web server process alive on port 3100. Subsequent runs attempt to launch a new server on the same port, hit `EADDRINUSE`, and never finish starting, causing Playwright to wait until timeout. The stuck condition persists until the stale server process is terminated manually.
