# Sunday Supply — React 19 E-Commerce (Tasks 1 and 2)

A responsive storefront, account-registration flow, product-details view, and optimistic cart built with React 19 and Vite. Product and cart data use simulated asynchronous APIs; no backend is required.

## Run locally

```bash
npm install
npm run dev
```

To create a production build, run `npm run build`.

## React 19 features

- **`use()` and `<Suspense>`:** `fetchProducts()` creates a Promise outside component rendering. `ProductList` reads that stable Promise with React's `use()` API. While it is pending, its nearest `<Suspense>` boundary shows animated product skeletons. A surrounding error boundary shows an error message and retry action if the Promise rejects.
- **`<form action={...}>` and `useActionState()`:** The registration form submits its `FormData` to an async action (not an `onSubmit` handler). The action validates name, email, and password, returns field errors for invalid input, and simulates a successful API request with a delay before returning success.
- **`useFormStatus()`:** The submit button is a child component inside the form and reads `pending` from `useFormStatus()`. It disables itself and displays a spinner while the action is running.
- **React Context:** `UserContext` holds the registered user's name and email. The app provides it using React 19's `<UserContext value={contextValue}>` syntax. `RegisteredUser` consumes that value and updates after a successful registration.
- **Asset loading APIs:** `preconnect()` warms the connection to `images.unsplash.com`, where the product photography is hosted. `preload()` prioritizes the first product image because it is the first image users encounter in the collection. Remaining product images are lazy-loaded by the browser.
- **Document Metadata:** React 19 hoists the `<title>` and description `<meta>` tag rendered by `App` into the document head.

## Registration flow

Use the “Create your account” form below the collection. Required fields, email format, and a minimum eight-character password are validated in the action. Invalid submissions show field-specific messages; valid submissions show a pending state followed by a welcome message and the registered account card near the top of the page.

## Task 2: Product details and cart

- **Product details:** Select a product card (or focus it and press Enter/Space) to view its image, name, price, description, and color in the details panel.
- **Optimistic cart:** `ProductDetails` uses `useOptimistic()` inside a React transition to increment the displayed cart count immediately. A simulated async request then either commits the item to the cart or rejects; on rejection React restores the count from the real cart state and the panel displays the error. The header cart count reflects confirmed items.
- **Failure demonstration:** Open “Demo API controls”, select “Simulate failure on the next add”, and add the item. The optimistic count appears while the request is pending, then rolls back with an error message. The checkbox resets after use so the next request can succeed.
- **Ref as a prop:** The reusable `SearchInput` accepts `ref` directly as a prop (without `forwardRef`). `CollectionSearch` uses that ref to focus the search field when “Focus search” is selected.
- **Callback-ref cleanup:** The product details panel has a stable callback ref that observes its size with `ResizeObserver`. It returns a cleanup function that disconnects the observer when the panel is removed. The measured width selects the compact details layout.

## Server and Client Components

This Vite application runs entirely in the browser; it does not enable React Server Components. In a framework with RSC support, the product catalog and read-only product details could be Server Components: they can fetch catalog data near the source, render the product content on the server, and keep server-only credentials out of the browser. The interactive Add to Cart control must be a Client Component because it handles click events, pending UI, local cart state, and `useOptimistic()`. The server-rendered details can include that client control and pass it serializable product data as props. The server can still validate and persist each cart update.

## React Compiler

React Compiler analyzes component code and automatically applies memoization where it can safely avoid unnecessary work, reducing the need to hand-write `memo`, `useMemo`, and `useCallback`. For example, when the search term or cart changes, it may skip re-rendering unchanged product-card content in the collection. Compiler optimization is not enabled in this Vite setup, so this describes how the app could benefit after adding the compiler plugin and following its compatibility requirements; it does not change the behavior of the current build.

## Screenshots

The supplied screenshots are saved in [`screenshots/`](./screenshots):

| State | Screenshot |
| --- | --- |
| Product listing | [product-listing.png](./screenshots/product-listing.png) |
| Product loading state | [loading-state.png](./screenshots/loading-state.png) |
| Registration form | [registration-form.png](./screenshots/registration-form.png) |
| Validation errors | [registration-validation.png](./screenshots/registration-validation.png) |
| Successful registration and registered-user card | [registered-user.png](./screenshots/registered-user.png) |

The registration pending state is implemented in the app. The Task 2 screenshots below show product details and the cart's optimistic, successful, and failed-request states.

| State | Screenshot |
| --- | --- |
| Product details and confirmed updated cart count | [product-details.png](./screenshots/product-details.png) |
| Optimistic cart count while the request is pending | [cart-optimistic-pending.png](./screenshots/cart-optimistic-pending.png) |
| Failed request and rolled-back cart count | [cart-failure-rollback.png](./screenshots/cart-failure-rollback.png) |

## GitHub submission

- Repository: [rsl-harshilSharma/react19-ecommerce-assignment](https://github.com/rsl-harshilSharma/react19-ecommerce-assignment)
- Assignment branch: `feature/task-1-screenshots`
- Pull request: [#1](https://github.com/rsl-harshilSharma/react19-ecommerce-assignment/pull/1)
