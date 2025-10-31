import { createContext, useContext, useState, type ReactNode } from 'react'

// Type definitions for our cart system
export interface Product {
  id: string
  name: string
  price: number
  description: string
  image?: string
}

export interface CartItem extends Product {
  quantity: number
}

// Type definition for our Context value
interface CartContextType {
  // State
  products: Product[]
  cart: CartItem[]
  
  // Actions
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  
  // Computed values
  cartCount: number
  cartTotal: number
}

// Create the Context
// This creates a context object that will hold our cart state and functions
const CartContext = createContext<CartContextType | undefined>(undefined)

// Sample products data
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    price: 29.99,
    description: 'Ergonomic wireless mouse with high precision tracking',
    image: '🖱️'
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    price: 89.99,
    description: 'RGB mechanical keyboard with Cherry MX switches',
    image: '⌨️'
  },
  {
    id: '3',
    name: 'USB-C Hub',
    price: 45.00,
    description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
    image: '🔌'
  },
  {
    id: '4',
    name: 'Wireless Headphones',
    price: 79.99,
    description: 'Premium noise-cancelling wireless headphones',
    image: '🎧'
  },
  {
    id: '5',
    name: 'Monitor Stand',
    price: 35.50,
    description: 'Adjustable monitor stand with cable management',
    image: '🖥️'
  },
  {
    id: '6',
    name: 'Desk Lamp',
    price: 42.00,
    description: 'LED desk lamp with adjustable brightness and color temperature',
    image: '💡'
  }
]

// Provider Component
// This component manages the state and provides it to all children
export function CartProvider({ children }: { children: ReactNode }) {
  // useState hook to manage products list
  const [products] = useState<Product[]>(initialProducts)
  
  // useState hook to manage cart items
  const [cart, setCart] = useState<CartItem[]>([])
  
  // Function to add a product to the cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        // If exists, increment quantity
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // If new item, add to cart with quantity 1
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }
  
  // Function to remove a product from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }
  
  // Function to clear entire cart
  const clearCart = () => {
    setCart([])
  }
  
  // Computed value: total number of items in cart
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  
  // Computed value: total price of items in cart
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  
  // Value object that will be provided to all consumers
  const value: CartContextType = {
    products,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal
  }
  
  // Return the Provider with the value
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom Hook to use the Cart Context
// This makes it easy to access cart state and functions in any component
export function useCart() {
  const context = useContext(CartContext)
  
  // Safety check: ensure we're using this hook within a CartProvider
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  
  return context
}

