---
applyTo: 'taropay_admin_mui/**'
---

# TaroPay Admin MUI — Copilot Instructions

## Architecture Overview

Vite + React 19 + TypeScript admin dashboard built on **Minimal UI Kit v7.6.1**. Key stack: **MUI v7**, **React Router v7**, **SWR + Axios**, **Zustand**, **React Hook Form + Zod 4**, **Sonner** for toasts.

Package manager: **Yarn 1.22**. Use `yarn dev` / `yarn build`.

## Project Structure (Three-Layer Pattern)

```
pages/        → Thin page shells (metadata + render section view)
sections/     → Business views (UI, DataGrid, toolbars, actions)
  └── module/
      ├── index.ts         → Re-exports
      ├── hooks.ts         → SWR data-fetching hooks
      ├── *-view.tsx       → Main view component
      └── toolbar.tsx      → Filter toolbar
api/          → API functions organized by domain (order.ts, login.ts, common.ts)
stores/       → Zustand global stores (auth, country, merchant)
lib/          → Core utilities (http.ts, i18n.ts, swr-config.ts, cookies.ts)
components/   → Shared UI (hook-form/, country-merchant-selector/, etc.)
```

## API & Data Fetching

- **HTTP client** (`src/lib/http.ts`): Custom `HttpClient` singleton wrapping Axios. Request interceptor auto-injects `Token` header, `country`, and `merchantId` from Zustand persist storage. Response interceptor handles `401` (redirect to login), `201` (error toast), `403` (refresh).
- **API functions** in `src/api/` call `http.get/post` directly — no hooks in this layer.
- **SWR hooks** live in each section's `hooks.ts`. Pattern:
  ```typescript
  const key = selectedCountry
    ? ['domain', 'action', params, selectedCountry.code, selectedMerchant?.appid]
    : null; // null key = skip fetch
  const { data, isLoading, mutate } = useSWR(key, () => apiFn(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
  ```
- Always include `selectedCountry.code` and `selectedMerchant?.appid` in SWR keys so data refreshes on context switch.

## State Management

| Store            | Persistence                                                   | Purpose                                                        |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| `auth-store`     | Manual `localStorage` (`_token`, `_userInfo`, `_permissions`) | Auth token, user info, permission checks via `hasPermission()` |
| `country-store`  | `zustand/persist` key `country-storage`                       | Selected country, display currency, exchange rates             |
| `merchant-store` | `zustand/persist` key `merchant-storage`                      | Selected merchant                                              |

- **URL search params** drive pagination and filters on all list pages (`useSearchParams`).
- HTTP interceptor reads directly from persist storage keys to avoid circular dependencies with React.

## Authentication

Dual-layer: **Zustand `auth-store`** is the source of truth; **AuthContext** (from Minimal template) bridges it for `AuthGuard`/`GuestGuard`.

Login flow: captcha → `loginApi({type:'login'})` → Google Auth check (bind or confirm) → `loginApi({type:'confirm'})` → store token + fetch permissions.

Logout: clear `localStorage` keys + clear Zustand stores + redirect with `returnTo`.

## Forms

Use **React Hook Form + Zod** with project-specific wrappers in `src/components/hook-form/`:

- `Form` (FormProvider wrapper), `Field` (unified entry), `RHFTextField`, `RHFSelect`, `RHFDatePicker`, `RHFAutocomplete`
- `schemaUtils` provides reusable Zod validators (date, email, phone, etc.)

## Routing

React Router v7 with `createBrowserRouter` in `src/main.tsx`. All paths centralized in `src/routes/paths.ts`. Dashboard routes use `lazy()` for code splitting. Route hooks: `usePathname`, `useRouter`, `useSearchParams` from `src/routes/hooks/`.

## Country/Merchant Context Pattern

Global header selector → Zustand stores → HTTP interceptor auto-injects → SWR keys include context → switching country/merchant auto-refetches all data. This is the core multi-tenant pattern of the app.

## i18n

Lightweight custom implementation (not i18next). `t('orders.receiveSummary.title')` via `useLanguage()` hook. Translations in `src/locales/{zh,en}.json`. Language stored in cookie.

## MUI Usage

- **MUI MCP 已配置**：遇到 MUI 组件用法不确定时，**必须先通过 MUI MCP 工具查询最新文档**，确保使用正确的 API 和最佳实践，避免使用已废弃的 props 或非惯用写法。
- **禁止硬编码样式值**：不得在代码中直接写死数值样式，如 `fontSize: 12`、`color: '#333'`、`padding: '8px 16px'` 等。应优先使用 MUI Theme tokens（`theme.spacing()`、`theme.typography.body2`、`theme.palette.text.secondary`）或 MUI `sx` prop 中的语义化 token（如 `fontSize: 'body2.fontSize'`、`color: 'text.secondary'`、`gap: 1`）。示例：
  ```typescript
  // ❌ 禁止
  sx={{ fontSize: 12, color: '#666', padding: '8px 16px' }}
  // ✅ 正确
  sx={{ fontSize: 'body2.fontSize', color: 'text.secondary', p: 2 }}
  ```
- **DataGrid 必须占满容器宽度**：列少时不要全部设固定 `width`，至少有一列使用 `flex: 1` 或不设宽度，让表格自动撑满，避免右侧留白。示例：
  ```typescript
  const columns: GridColDef[] = [
    { field: 'date', headerName: '日期', width: 150 },
    { field: 'channel', headerName: '渠道', width: 200 },
    { field: 'amount', headerName: '金额', flex: 1, minWidth: 120 }, // 自动填充剩余空间
  ];
  ```
- **DataGrid 文本溢出 Tooltip**：纯文本列需要溢出省略号 + hover 显示完整内容时，使用 `renderCellWithTooltip`（`src/components/data-grid/render-cell-with-tooltip.tsx`）。该函数仅在文本确实被截断时才弹出轻量 Popper 浮层，无动画、无跳动。用法：

  ```typescript
  import { renderCellWithTooltip } from 'src/components/data-grid';

  const columns: GridColDef[] = [
    { field: 'name', headerName: '名称', width: 120, renderCell: renderCellWithTooltip },
    {
      field: 'remark',
      headerName: '备注',
      flex: 1,
      minWidth: 150,
      renderCell: renderCellWithTooltip,
    },
  ];
  ```

  **注意**：不要自行用 MUI `Tooltip` 包裹 DataGrid 单元格文本（会导致高度跳动和 arrow 残留），统一使用此工具函数。

## Naming Conventions

- **组件命名必须语义化**，以功能/用途命名而非泛化名称。文件名使用 kebab-case，示例：
  - 搜索筛选区域 → `xxx-search.tsx`
  - 订单详情抽屉 → `order-detail-drawer.tsx`
  - 行操作菜单 → `order-row-actions.tsx`
  - 视图组件 → `receive-summary-view.tsx`
- **避免**使用 `Component1.tsx`、`Section.tsx`、`Content.tsx` 等无意义命名。

## Conventions

- **Toasts**: Always use `sonner` — `toast.success()` / `toast.error()`. Never `alert()` or MUI Snackbar directly.
- **Icons**: Use `@iconify/react` via `src/components/iconify/`.
- **Date handling**: `dayjs` with formatters in `src/utils/format-time.ts`.
- **Amount conversion**: `useConvertAmount` hook applies exchange rates based on `displayCurrency` from country store.
- **Env vars**: Prefixed with `VITE_`. Dev uses Vite proxy (`/admin` → test server); test/prod use direct `VITE_TRAOPAY_API_URL`.
- **Response type**: All API responses follow `{ code, message, data?, result? }` shape (`ResponseData<T>`).
- **Section modules**: Follow the fixed structure: `index.ts` + `hooks.ts` + `*-view.tsx` + `toolbar.tsx`.
