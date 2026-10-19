import {
  Component,
  Suspense,
  createContext,
  use,
  useActionState,
  useCallback,
  useContext,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react'
import { preconnect, preload, useFormStatus } from 'react-dom'
import './App.css'

const imageUrl = (photo, width = 720) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=85`

const products = [
  {
    id: 1,
    name: 'Everyday Runner',
    price: 98,
    category: 'Footwear',
    description: 'A featherlight everyday sneaker with a soft, cushioned sole.',
    image: imageUrl('photo-1542291026-7eec264c27ff'),
    color: 'Coral / Cloud',
    label: 'BESTSELLER',
  },
  {
    id: 2,
    name: 'Studio Watch',
    price: 145,
    category: 'Accessories',
    description: 'A considered timepiece with a brushed steel case and clean dial.',
    image: imageUrl('photo-1523275335684-37898b6baf30'),
    color: 'Silver / Ivory',
    label: 'JUST IN',
  },
  {
    id: 3,
    name: 'Form Headphones',
    price: 189,
    category: 'Technology',
    description: 'Immersive sound and all-day comfort, thoughtfully designed.',
    image: imageUrl('photo-1505740420928-5e560c06d30e'),
    color: 'Sand / Black',
  },
  {
    id: 4,
    name: 'Sunday Tote',
    price: 68,
    category: 'Bags',
    description: 'An easy, durable carryall made for slow mornings and big days.',
    image: imageUrl('photo-1590874103328-eac38a683ce7'),
    color: 'Natural / Canvas',
  },
  {
    id: 5,
    name: 'Daylight Camera',
    price: 229,
    category: 'Technology',
    description: 'A pocket-sized camera for keeping the little moments close.',
    image: imageUrl('photo-1516035069371-29a1b244cc32'),
    color: 'Matte Black',
    label: 'LIMITED',
  },
  {
    id: 6,
    name: 'Soft Form',
    price: 112,
    category: 'Apparel',
    description: 'An effortlessly soft layer with a relaxed, versatile shape.',
    image: imageUrl('photo-1529139574466-a303027c1d8b'),
    color: 'Warm Taupe',
  },
]

const fetchProducts = () =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(products), 1100)
  })

const addProductToCart = (product, shouldFail) =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`We couldn't add ${product.name}. Please try again.`))
        return
      }

      resolve()
    }, 1100)
  })

let productsPromise = fetchProducts()
const resetProductsPromise = () => {
  productsPromise = fetchProducts()
}

const UserContext = createContext(null)
const CartContext = createContext(null)

function ProductList({ searchTerm, selectedProductId, onSelectProduct }) {
  const productList = use(productsPromise)
  const filteredProducts = productList.filter((product) =>
    `${product.name} ${product.category} ${product.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="product-grid">
      {filteredProducts.map((product, index) => (
        <article
          className={`product-card${selectedProductId === product.id ? ' product-card-selected' : ''}`}
          key={product.id}
          role="button"
          tabIndex={0}
          aria-pressed={selectedProductId === product.id}
          aria-label={`View details for ${product.name}`}
          onClick={() => onSelectProduct(product)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelectProduct(product)
            }
          }}
        >
          <div className={`product-image product-image-${index + 1}`}>
            {product.label && <span className="product-label">{product.label}</span>}
            <img src={product.image} alt={product.name} loading={index === 0 ? 'eager' : 'lazy'} />
            <span className="favorite-button" aria-hidden="true">
              <HeartIcon />
            </span>
          </div>
          <div className="product-info">
            <div className="product-copy">
              <span className="product-category">{product.category}</span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </div>
            <span className="product-price">${product.price}</span>
          </div>
          <div className="product-meta">
            <span>{product.color}</span>
            <span className="swatches" aria-label="Available colors">
              <i />
              <i />
              <i />
            </span>
          </div>
        </article>
      ))}
      {filteredProducts.length === 0 && (
        <p className="empty-products">No products match “{searchTerm}”. Try another search.</p>
      )}
    </div>
  )
}

function SearchInput({ ref, value, onChange }) {
  return (
    <input
      ref={ref}
      className="product-search"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search the collection"
      aria-label="Search products"
    />
  )
}

function CollectionSearch({ searchTerm, onSearchTermChange }) {
  const searchRef = useRef(null)

  return (
    <div className="collection-search">
      <SearchInput
        ref={searchRef}
        value={searchTerm}
        onChange={onSearchTermChange}
      />
      <button
        type="button"
        className="focus-search-button"
        onClick={() => searchRef.current?.focus()}
      >
        Focus search
      </button>
    </div>
  )
}

function ProductDetails({ product, cartItems, onAddToCart }) {
  const [optimisticCount, addOptimisticItem] = useOptimistic(
    cartItems.length,
    (count, _product) => count + 1,
  )
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState('')
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [detailsWidth, setDetailsWidth] = useState(0)
  const detailsRef = useCallback((node) => {
    if (!node) return

    if (typeof ResizeObserver === 'undefined') {
      setDetailsWidth(node.getBoundingClientRect().width)
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      setDetailsWidth(entry.contentRect.width)
    })
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const handleAddToCart = () => {
    const shouldFail = simulateFailure
    setSimulateFailure(false)
    setErrorMessage('')

    startTransition(async () => {
      addOptimisticItem(product)

      try {
        await addProductToCart(product, shouldFail)
        onAddToCart(product)
      } catch (error) {
        if (!(error instanceof Error)) throw error
        setErrorMessage(error.message)
      }
    })
  }

  return (
    <section
      ref={detailsRef}
      className={`product-details${detailsWidth > 0 && detailsWidth < 680 ? ' product-details-compact' : ''}`}
      aria-labelledby="product-details-title"
    >
      <div className="details-image-wrap">
        <img src={product.image} alt={product.name} />
        {product.label && <span className="product-label">{product.label}</span>}
      </div>
      <div className="details-copy">
        <span className="eyebrow">{product.category}</span>
        <h3 id="product-details-title">{product.name}</h3>
        <p className="details-price">${product.price}</p>
        <p className="details-description">{product.description}</p>
        <p className="details-color">Color: {product.color}</p>
        <div className="cart-summary" role="status" aria-live="polite" aria-atomic="true">
          <span>Cart</span>
          <strong>{optimisticCount}</strong>
          {isPending && <span className="cart-pending">Updating…</span>}
        </div>
        <button
          type="button"
          className="add-to-cart-button"
          onClick={handleAddToCart}
          disabled={isPending}
        >
          {isPending ? 'Adding to cart…' : 'Add to cart'}
          <span aria-hidden="true">↗</span>
        </button>
        {errorMessage && (
          <p className="cart-error" role="alert">
            {errorMessage} Your cart count has been restored.
          </p>
        )}
        <details className="demo-controls">
          <summary>Demo API controls</summary>
          <label>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(event) => setSimulateFailure(event.target.checked)}
              disabled={isPending}
            />
            Simulate failure on the next add
          </label>
        </details>
      </div>
    </section>
  )
}

function ProductLoading() {
  return (
    <div className="product-grid" aria-label="Loading products" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="product-skeleton" key={index}>
          <div className="skeleton-image" />
          <div className="skeleton-line skeleton-short" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-medium" />
        </div>
      ))}
      <span className="visually-hidden">Loading the collection…</span>
    </div>
  )
}

class ProductErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-panel" role="alert">
          <p>We couldn’t load the collection just now.</p>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              resetProductsPromise()
              this.setState({ hasError: false })
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function RegisteredUser() {
  const { user } = useContext(UserContext)

  return (
    <section className={`member-card${user ? ' member-card-registered' : ''}`} aria-live="polite">
      <div className="member-icon">{user ? <CheckIcon /> : <UserIcon />}</div>
      <div>
        <span className="eyebrow">{user ? 'YOU’RE ON THE LIST' : 'YOUR ACCOUNT'}</span>
        {user ? (
          <>
            <h3>Welcome, {user.name}.</h3>
            <p>{user.email}</p>
          </>
        ) : (
          <>
            <h3>Good things start here.</h3>
            <p>Create an account to get the most from your next visit.</p>
          </>
        )}
      </div>
      {user && <span className="member-badge">MEMBER</span>}
    </section>
  )
}

const initialFormState = { status: 'idle', errors: {}, values: {} }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button className="submit-button" type="submit" disabled={pending}>
      {pending ? (
        <>
          <span className="button-spinner" />
          Creating your account…
        </>
      ) : (
        <>
          Create account <span aria-hidden="true">↗</span>
        </>
      )}
    </button>
  )
}

function RegistrationForm() {
  const { setUser } = useContext(UserContext)
  const [state, formAction] = useActionState(async (_previousState, formData) => {
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const errors = {}

    if (!name) errors.name = 'Please enter your name.'
    if (!email) {
      errors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.'
    }
    if (password.length < 8) errors.password = 'Use at least 8 characters.'

    const values = { name, email }
    if (Object.keys(errors).length) return { status: 'error', errors, values }

    await new Promise((resolve) => window.setTimeout(resolve, 1400))
    setUser({ name, email })
    return { status: 'success', errors: {}, values }
  }, initialFormState)

  return (
    <section className="registration-panel" id="join">
      <div className="registration-heading">
        <span className="eyebrow">A LITTLE MORE LOVELY</span>
        <h2>Make yourself<br />at home.</h2>
        <p>Join our little corner of the internet for first looks, thoughtful finds, and a welcome treat.</p>
        <div className="member-perk"><span aria-hidden="true">✳</span> Enjoy 10% off your first order</div>
      </div>
      <form action={formAction} className="registration-form" noValidate>
        <div className="form-intro">
          <h3>Create your account</h3>
          <p>It only takes a moment.</p>
        </div>
        <FormField
          label="Your name"
          name="name"
          placeholder="e.g. Alex Morgan"
          autoComplete="name"
          error={state.errors.name}
          defaultValue={state.values.name ?? ''}
        />
        <FormField
          label="Email address"
          name="email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          error={state.errors.email}
          defaultValue={state.values.email ?? ''}
        />
        <FormField
          label="Password"
          name="password"
          placeholder="At least 8 characters"
          type="password"
          autoComplete="new-password"
          error={state.errors.password}
        />
        <SubmitButton />
        {state.status === 'error' && (
          <p className="form-message form-error" role="alert">
            Please check the details above and try again.
          </p>
        )}
        {state.status === 'success' && (
          <p className="form-message form-success" role="status">
            You’re all set. Welcome to the good stuff!
          </p>
        )}
        <p className="privacy-note">By joining, you agree to our friendly terms and privacy policy.</p>
      </form>
    </section>
  )
}

function FormField({ label, name, placeholder, type = 'text', autoComplete, error, defaultValue }) {
  const errorId = `${name}-error`

  return (
    <div className={`form-field${error ? ' form-field-error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <span className="field-error" id={errorId}>{error}</span>}
    </div>
  )
}

function Header() {
  const { count } = useContext(CartContext)

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Sunday Supply home">
        sunday<span>·</span>supply
      </a>
      <nav aria-label="Main navigation">
        <a href="#collection">The collection</a>
        <a href="#join">Our little club</a>
      </nav>
      <a className="header-account" href="#join">
        <UserIcon />
        <span>My account</span>
      </a>
      <a className="header-cart" href="#collection" aria-label={`Cart: ${count} items`}>
        Cart <span>{count}</span>
      </a>
    </header>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [searchTerm, setSearchTerm] = useState('')
  const contextValue = { user, setUser }
  const cartContextValue = { count: cartItems.length }

  preconnect('https://images.unsplash.com', { crossOrigin: 'anonymous' })
  preload(products[0].image, { as: 'image', fetchPriority: 'high' })

  return (
    <UserContext value={contextValue}>
      <CartContext value={cartContextValue}>
        <title>Sunday Supply — Thoughtful things for everyday</title>
        <meta
          name="description"
          content="Meet the everyday essentials you'll reach for again and again. Thoughtful things, chosen with care."
        />
        <div id="top" className="store-shell">
          <div className="announcement-bar">
            A little treat: free shipping on orders over $75 <span>✳</span>
          </div>
          <Header />
          <main>
            <section className="hero-section">
              <div className="hero-copy">
                <span className="eyebrow"><span className="eyebrow-dot" /> THE EVERYDAY EDIT</span>
                <h1>Good things,<br /><em>well chosen.</em></h1>
                <p>Thoughtful things for wherever the day takes you. Made to be used, loved, and lived in.</p>
                <a className="hero-link" href="#collection">Find your everyday <span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero-art" role="img" aria-label="A curated collection of everyday essentials">
                <div className="hero-art-note">
                  <span>THE SUNDAY EDIT</span>
                  <span>№ 08 — EVERYDAY</span>
                </div>
                <div className="hero-stamp">SLOW<br />GOODS<br /><span>FOR GOOD DAYS</span></div>
                <span className="hero-sparkle" aria-hidden="true">✳</span>
              </div>
            </section>
            <RegisteredUser />
            <section className="collection-section" id="collection">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE GOOD STUFF</span>
                  <h2>Everyday favorites</h2>
                </div>
                <p>Simple things, made a little more special.<br />Picked with care, just for you.</p>
              </div>
              <CollectionSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
              <ProductErrorBoundary>
                <Suspense fallback={<ProductLoading />}>
                  <ProductList
                    searchTerm={searchTerm}
                    selectedProductId={selectedProduct.id}
                    onSelectProduct={setSelectedProduct}
                  />
                </Suspense>
              </ProductErrorBoundary>
              <div className="details-heading">
                <span className="eyebrow">A CLOSER LOOK</span>
                <h2>Product details</h2>
                <p>Select any item above to explore it.</p>
              </div>
              <ProductDetails
                key={selectedProduct.id}
                product={selectedProduct}
                cartItems={cartItems}
                onAddToCart={(product) => setCartItems((items) => [...items, product])}
              />
            </section>
            <RegistrationForm />
          </main>
          <footer className="site-footer">
            <a className="wordmark" href="#top">sunday<span>·</span>supply</a>
            <span>Thoughtful things for everyday.</span>
            <span>© 2026 Sunday Supply</span>
          </footer>
        </div>
      </CartContext>
    </UserContext>
  )
}

export default App

function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20c.5-3.1 2.8-5 6.5-5s6 1.9 6.5 5" /></svg>
}

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" /></svg>
}
