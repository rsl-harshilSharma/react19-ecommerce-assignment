# Sunday Supply — React 19 E-Commerce (Task 1)

A small, responsive storefront and account-registration flow built with React 19 and Vite. Product data is returned by a simulated asynchronous API; no backend is required.

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

## Screenshots

The supplied screenshots are saved in [`screenshots/`](./screenshots):

| State | Screenshot |
| --- | --- |
| Product listing | [product-listing.png](./screenshots/product-listing.png) |
| Product loading state | [loading-state.png](./screenshots/loading-state.png) |
| Registration form | [registration-form.png](./screenshots/registration-form.png) |
| Validation errors | [registration-validation.png](./screenshots/registration-validation.png) |
| Successful registration and registered-user card | [registered-user.png](./screenshots/registered-user.png) |

The pending submission state is implemented in the app; capture it while the simulated request is in progress if a separate pending-state screenshot is required.

## GitHub submission

- Repository: [rsl-harshilSharma/react19-ecommerce-assignment](https://github.com/rsl-harshilSharma/react19-ecommerce-assignment)
- Main branch: `main`
- Task 1 screenshots branch: `feature/task-1-screenshots`
