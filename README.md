# Dots Password Manager v4

A modern, full-featured password manager web app built with TanStack Start, React 19, Drizzle ORM, and PostgreSQL. This project is a complete migration and rewrite of the legacy Dots Password Manager (previously .NET 8 Web API + Angular), designed for strict data and security compatibility with the existing production database and encrypted vault data.

---

## Project Background

- **Migration:** This codebase was created by porting all core features, data models, and security logic from the legacy app. The goal was to preserve all user data, authentication, and encryption compatibility, while modernizing the stack and UX.
- **Compatibility:** Custom validators, crypto routines, and auth flows were adapted to ensure seamless operation with existing user accounts, password hashes, and encrypted vault entries.
- **UI/UX:** The interface uses shadcn/ui, Tailwind CSS, and [AstroVista](https://tweakcn.com/themes/cmlk6zefr000004lbe9jygsqc) theming for a modern, accessible experience.

---

## Features

- Secure session-based authentication (cookie sessions, powered by Better Auth)
    - Fully compatible with legacy password hashes and user data
- Vault: add, edit, favorite, and organize passwords
- Import/export vault data (compatible with legacy format)
- Responsive, accessible UI with shadcn primitives
- Command palette for fast navigation and actions
- Settings page for user/account management
- Email notifications (reset, welcome, etc.)
- Full SSR/SPA support with TanStack Start
- Docker and Compose ready for deployment

---

## Requirements

- **Bun**: v1.3.11 or newer ([Install Bun](https://bun.sh/docs/installation))
- **Node.js**: v20+ (for production w/o docker)
- **PostgreSQL**: v13+ (existing or new database)
- **.env.local**: See `.env.example` for required variables

---

## Getting Started (Development)

1. **Install dependencies:**
    ```sh
    bun install
    ```
2. **Configure environment:**
    - Copy `.env.example` to `.env.local` and fill in all required values.
    - Make sure your DB is running and accessible.
3. **Run the app:**
    ```sh
    bun run dev
    ```
    The app will be available at http://localhost:3000

---

## Useful Commands

- **Run tests:**
    ```sh
    bun run test
    ```
- **Lint code:**
    ```sh
    bun run lint
    ```
- **Format code:**
    ```sh
    bun run format
    ```
- **Build for production:**
    ```sh
    bun run build
    ```

---

## Deployment

### 1. Docker (Recommended)

- **Build the image:**
    ```sh
    docker build -t ghcr.io/giorgiodots/dots-password-manager:prodv4 .
    ```
- **Run the container:**
    ```sh
    docker run --name dots-password-manager-v4 --env-file .env.local -p 3000:3000 ghcr.io/giorgiodots/dots-password-manager:prodv4
    ```
- **Push to registry:**
    ```sh
    docker push ghcr.io/giorgiodots/dots-password-manager:prodv4
    ```

### 2. Docker Compose

- See `docker-compose.yml` for a sample multi-service setup (app + Postgres).
- Example:
    ```sh
    docker compose up --build
    ```

### 3. Plain Node Server (Advanced)

- **Build:**
    ```sh
    bun run build
    ```
- **Start:**
    ```sh
    node .output/server/index.mjs
    ```
    (Make sure all required env vars are set)

---

## Security & Compatibility Notes

- **Data continuity:** All crypto and auth logic is compatible with legacy data. You can migrate user data and vault entries without re-encryption or password resets.
- **Secrets:** Never commit real secrets. Use `.env.local` for local/dev and platform env config for production.
- **Validation:** Always run `bun run lint`, `bun run test`, and `bun run build` before deploying.
- **DB config:** Supports both `DATABASE_URL` and split DB env vars. Handles Docker `.env` quoting issues automatically.

---

## Contributing

- See [AGENTS.md](AGENTS.md) for repo-specific coding standards and agent workflow expectations.
- PRs and issues welcome!

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
