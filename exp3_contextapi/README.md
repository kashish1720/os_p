# Shopping Cart Demo - React Context API

A fully functional shopping cart application built with React and Context API to demonstrate complex state management.

## 🎯 Project Overview

This project is a **Full Stack Development experiment** showcasing how to manage complex state using **React Context API**. It demonstrates shared global state between multiple components without prop drilling.

## 🚀 Features

- **Context API State Management**: Centralized cart state accessible from any component
- **Dynamic Cart Updates**: Real-time cart count and total calculations
- **Add to Cart**: Add products with quantity tracking
- **Remove from Cart**: Remove individual items
- **Clear Cart**: Reset all cart items
- **Responsive Design**: Beautiful UI with Tailwind CSS
- **Smooth Animations**: Hover effects and transitions

## 🏗️ Architecture

### Context API Implementation

The application uses React Context API to manage global state:

1. **CartContext.tsx**: Defines the context with:
   - Products list
   - Cart items
   - State management functions (`addToCart`, `removeFromCart`, `clearCart`)
   - Computed values (`cartCount`, `cartTotal`)

2. **CartProvider**: Wraps the entire app, making context available to all components

3. **useCart Hook**: Custom hook to access cart state in any component

### Components

- **Navbar**: Displays cart count badge
- **ProductList**: Shows products with "Add to Cart" buttons
- **Cart**: Lists cart items with remove functionality
- **App**: Main component with tab navigation

## 🛠️ Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Context API**: State management

## 📦 Installation

```bash
npm install
```

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
exp3_contextapi/
├── src/
│   ├── context/
│   │   └── CartContext.tsx      # Context API setup
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── ProductList.tsx      # Products display
│   │   └── Cart.tsx             # Cart display
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── style.css                # Tailwind imports
├── index.html
├── package.json
├── tailwind.config.cjs
├── postcss.config.cjs
└── tsconfig.json
```

## 🎓 Key Concepts Demonstrated

### 1. Context Creation

```typescript
const CartContext = createContext<CartContextType | undefined>(undefined)
```

### 2. Provider Component

```typescript
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  // ... state and functions
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
```

### 3. Custom Hook

```typescript
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
```

### 4. Using Context in Components

```typescript
const { cart, addToCart, cartCount } = useCart()
```

## 🌟 Features Explained

### Add to Cart

When a product is added:
1. Check if item already exists
2. If exists, increment quantity
3. If new, add with quantity 1
4. All components automatically update

### Dynamic Updates

- Navbar cart badge updates instantly
- Cart page shows current items
- Total price calculated dynamically
- Quantity tracking per item

### Responsive Design

- Mobile-first approach
- Grid layout adapts to screen size
- Touch-friendly buttons
- Smooth animations

## 📝 Notes

- The `verbatimModuleSyntax` TypeScript option requires type-only imports for types
- Tailwind CSS v3 is used with CommonJS config files
- All components use functional components with hooks
- No external state management libraries needed

## 🎯 Learning Outcomes

- Understanding React Context API
- Managing complex state without prop drilling
- Creating reusable context providers
- Building custom hooks
- Type-safe React with TypeScript
- Modern CSS with Tailwind

## 🔄 Extending the Project

Potential enhancements:
- Add user authentication context
- Implement product filtering/search
- Add wishlist functionality
- Integrate with backend API
- Add persistent storage (localStorage)
- Implement checkout flow

## 📄 License

Educational project for Full Stack Development course.

