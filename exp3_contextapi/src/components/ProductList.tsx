import { useCart } from '../context/CartContext'

/**
 * ProductList Component
 * 
 * Displays all available products with Add to Cart buttons.
 * Uses Context API to access products list and addToCart function.
 */
export default function ProductList() {
  // Access products and addToCart function from Context
  const { products, addToCart } = useCart()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-4 border-blue-500 pb-2">
        Available Products
      </h2>
      
      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
          >
            {/* Product Image/Emoji */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center">
              <span className="text-8xl">{product.image}</span>
            </div>
            
            {/* Product Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4 min-h-[60px]">
                {product.description}
              </p>
              
              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              
              {/* Add to Cart Button */}
              {/* This button calls addToCart from Context, updating global state */}
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                ➕ Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

