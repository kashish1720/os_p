import { useState } from 'react'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProductList from './components/ProductList'
import Cart from './components/Cart'

/**
 * Main App Component
 * 
 * This is the root component that wraps everything with the CartProvider.
 * The Provider makes the cart context available to all child components.
 */
function App() {
  // Local state to toggle between Products and Cart views
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products')
  
  return (
    // CartProvider wraps the entire app, providing Context to all children
    // This is the key part: any component inside CartProvider can access the cart state
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Navbar - displays cart count from Context */}
        <Navbar />
        
        {/* Tab Navigation */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 font-semibold transition-all duration-200 ${
                  activeTab === 'products'
                    ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                🏪 Products
              </button>
              <button
                onClick={() => setActiveTab('cart')}
                className={`px-6 py-4 font-semibold transition-all duration-200 ${
                  activeTab === 'cart'
                    ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                🛒 Cart
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="pb-12">
          {activeTab === 'products' ? (
            // ProductList component - can add items to cart via Context
            <ProductList />
          ) : (
            // Cart component - can view and remove items via Context
            <Cart />
          )}
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              🎓 Shopping Cart Demo | React Context API State Management
            </p>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}

export default App

