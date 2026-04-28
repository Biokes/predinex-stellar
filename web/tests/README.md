# Web Frontend Tests

This directory contains tests for the Next.js web frontend application.

## Test Structure

- `setup.ts` - Test environment configuration and mocks
- `components/` - React component tests
- `routes/` - Route-level smoke tests (verifies each top-level App Router page mounts without crashing)
- `lib/` - API client and utility function tests
- `helpers/` - Shared render utilities (`renderWithProviders`)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

### Components
- **AuthGuard** - Authentication guard component
- **BettingSection** - Betting interface component

### API Client
- **stacks-api** - Contract interaction functions
  - `getPoolCount()` - Fetch total pool count
  - `getPool()` - Fetch individual pool data
  - `fetchActivePools()` - Fetch all active pools
  - `getUserBet()` - Fetch user bet data

## Mocking

Tests use Vitest mocks for:
- Next.js navigation hooks
- Stacks Connect wallet integration
- Stacks Provider context
- @stacks/transactions API calls

