import { useCart } from '../context/CartContext'

/**
 * Cart Component
 * 
 * Displays all items in the shopping cart with remove functionality.
 * Uses Context API to access cart items, total, and removeFromCart function.
 */
export default function Cart() {
  // Access cart state and functions from Context
  const { cart, cartTotal, removeFromCart, clearCart } = useCart()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 border-b-4 border-blue-500 pb-2">
          Your Cart
        </h2>
        
        {/* Clear Cart Button - only show if cart has items */}
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            🗑️ Clear Cart
          </button>
        )}
      </div>
      
      {/* Empty Cart Message */}
      {cart.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
          <span className="text-9xl block mb-4">🛒</span>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500">
            Add some products to get started!
          </p>
        </div>
      ) : (
        <>
          {/* Cart Items List */}
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  {/* Product Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-6xl">{item.image}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-600 font-semibold">
                          ${item.price.toFixed(2)} each
                        </span>
                        <span className="text-gray-500">
                          Quantity: <span className="font-bold text-blue-600">{item.quantity}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price and Remove Button */}
                  <div className="flex flex-col items-end space-y-3">
                    <span className="text-2xl font-bold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    {/* Remove button calls removeFromCart from Context */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-gray-800">
                Total:
              </span>
              <span className="text-4xl font-bold text-green-600">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Items in cart:</span>
              <span className="font-semibold">{cart.length}</span>
            </div>
          </div>
          
          {/* Checkout Button */}
          <div className="mt-6">
            <button
              onClick={() => alert('Thanks for your interest! This is a demo app.')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-xl"
            >
              🎉 Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

