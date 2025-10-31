import { useCart } from '../context/CartContext'

/**
 * Navbar Component
 * 
 * Displays the navigation bar with the shopping cart icon and item count.
 * Demonstrates Context API usage by consuming the cartCount from context.
 */
export default function Navbar() {
  // Use the useCart hook to access cart state from Context
  // This is how we consume context in a component
  const { cartCount } = useCart()
  
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🛒</span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Shopping Cart Demo
            </h1>
          </div>
          
          {/* Cart Icon with Badge */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              {/* Cart Icon */}
              <span className="text-4xl">🛍️</span>
              
              {/* Badge showing cart count - dynamically updates via Context */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center animate-pulse shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
            
            {/* Cart Count Text */}
            <div className="hidden md:block">
              <p className="text-lg font-semibold">
                {cartCount === 0 
                  ? 'Cart is empty' 
                  : `${cartCount} item${cartCount > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

