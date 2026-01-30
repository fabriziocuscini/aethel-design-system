# Aethel Design System

A modern design system monorepo built with TypeScript, React, and Panda CSS.

## Monorepo Structure

```
aethel-design-system/
├── packages/
│   ├── design-tokens/     # @aethel/tokens - Design tokens via Style Dictionary
│   ├── ui/                # @aethel/ui - React component library
│   └── docs/              # Documentation site with Fumadocs
├── package.json           # Root workspace config
├── turbo.json            # Turborepo pipeline config
├── tsconfig.json         # Base TypeScript config
└── biome.json            # BiomeJS config (formatter + linter)
```

## Packages

| Package | Description | Published |
|---------|-------------|-----------|
| `@aethel/tokens` | Design tokens (colors, spacing, typography) | Yes |
| `@aethel/ui` | React component library with Panda CSS + Ark UI | Yes |
| `@aethel/docs` | Documentation site | No (internal) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or later

### Installation

```bash
bun install
```

### Development

```bash
# Start all packages in development mode
bun run dev

# Build all packages
bun run build

# Run linting
bun run lint

# Format code
bun run format

# Type check
bun run typecheck
```

## Toolchain

- **Package Manager:** Bun with workspaces
- **Build Orchestration:** Turborepo
- **Library Bundling:** tsdown (Rolldown)
- **App Bundling:** Vite
- **Code Quality:** BiomeJS (formatting + linting)
- **Language:** TypeScript (strict mode)

## License

MIT
