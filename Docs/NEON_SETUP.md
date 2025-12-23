# PostgreSQL Setup Guide (Neon.tech)

We have successfully migrated the codebase to use PostgreSQL with Prisma. Follow these steps to provision your database and connect it to the application.

## 1. Create a Database (via Neon.tech)
We recommend **Neon** because it is serverless, auto-scaling, and built for Next.js.

1.  Go to [Neon.tech](https://neon.tech) and **Sign Up**.
2.  Click **"Create Project"**.
3.  Name it `genz-jewelry` (or similar).
4.  Select a region close to your users (e.g., `US East (N. Virginia)`).
5.  Click **Create Project**.

## 2. Get the Connection String
Once the project is created, you will see a **Connection Details** panel.

1.  Look for the **Connection String**.
2.  Ensure **"Pooled connection"** checked (if available/applicable, otherwise the default string works for Prisma).
3.  Copy the string. It should look like:
    ```
    postgresql://alex:AbCdEf12345@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
    ```

## 3. Configuration
You need to provide this string to the application.

### Option A: Paste it to the Agent (Easiest)
Paste the connection string in the chat, and I will configure it for you.

### Option B: Manual Configuration
1.  Open `.env.local` in your project root.
2.  Add (or update) the `DATABASE_URL` variable:
    ```bash
    DATABASE_URL="postgresql://alex:AbCdEf12345@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
    ```
3.  Save the file.

## 4. Launching the App
Once the configuration is set, run the following commands in your terminal to synchronize the database schema and seed the data:

```bash
# 1. Push the schema to the new database
npx prisma db push

# 2. Seed the products
npm run db:seed

# 3. Seed the admin user
npm run seed:auth

# 4. Start the app
npm run dev
```

## Troubleshooting
*   **"Authentication failed":** Double-check that you copied the full password in the URL.
*   **"Can't reach database":** Ensure your internet connection is active. Neon allows access from anywhere by default (no IP whitelisting needed usually, unlike Mongo).
