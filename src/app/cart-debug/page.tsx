'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/button';

// Disable static generation for debug pages
export const dynamic = 'force-dynamic';

export default function CartDebugPage() {
  const { cart, addToCart, getCart, getTotalItems, isLoading } = useCartStore();
  const [testResult, setTestResult] = useState<string>('');

  const testAddToCart = async () => {
    try {
      setTestResult('Testing add to cart...');
      
      // Mock product for testing
      const testProduct = {
        id: 1,
        name: 'Test Product',
        price: 100,
        slug: 'test-product',
        description: 'Test description',
        short_description: 'Test short description',
        compare_price: 120,
        cost_price: 80,
        sku: 'TEST001',
        stock_quantity: 10,
        min_stock_level: 0,
        manage_stock: true,
        in_stock: true,
        weight: 0,
        category_id: 1,
        status: 'active' as const,
        is_featured: false,
        is_digital: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await addToCart(testProduct, 1);
      setTestResult('✅ Add to cart successful! Check console for logs.');
    } catch (error: any) {
      setTestResult(`❌ Add to cart failed: ${error.message}`);
      console.error('Add to cart error:', error);
    }
  };

  const testGetCart = async () => {
    try {
      setTestResult('Fetching cart...');
      await getCart();
      setTestResult('✅ Get cart successful! Check console for logs.');
    } catch (error: any) {
      setTestResult(`❌ Get cart failed: ${error.message}`);
      console.error('Get cart error:', error);
    }
  };

  const useTestSession = () => {
    try {
      localStorage.setItem('guest_session_id', 'test-session-123');
      setTestResult('✅ Switched to test session! Refresh the page to see the cart with 10 items.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setTestResult(`❌ Failed to set test session: ${error.message}`);
    }
  };

  const useAuthenticatedUser = () => {
    try {
      // Remove guest session and add auth token
      localStorage.removeItem('guest_session_id');
      localStorage.setItem('auth_token', '13|mLjHjIcO2vEVW5huhwjp1uFDTHZaPBrOO6TLNAHIe834a34b');
      localStorage.setItem('user_data', JSON.stringify({
        id: 11,
        name: 'Test User',
        email: 'test@example.com'
      }));
      setTestResult('✅ Switched to authenticated user! Refresh the page to test authenticated cart.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      setTestResult(`❌ Failed to set authenticated user: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Cart Debug Page</h1>
      
      <div className="space-y-6">
        {/* Current Cart State */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current Cart State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Total Items:</strong> {getTotalItems()}</p>
            <p><strong>Cart Exists:</strong> {cart ? 'Yes' : 'No'}</p>
            {cart && (
              <div>
                <p><strong>Items Count:</strong> {cart.items?.length || 0}</p>
                <p><strong>Subtotal:</strong> ₹{cart.subtotal}</p>
                <p><strong>Items:</strong></p>
                <pre className="text-sm bg-white p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(cart.items, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-x-4">
          <Button onClick={testAddToCart} disabled={isLoading}>
            Test Add to Cart
          </Button>
          <Button onClick={testGetCart} variant="outline" disabled={isLoading}>
            Test Get Cart
          </Button>
          <Button onClick={useTestSession} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
            Use Test Session (10 items)
          </Button>
          <Button onClick={useAuthenticatedUser} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            Use Authenticated User
          </Button>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <p>{testResult}</p>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Session Information:</h3>
          <p><strong>Session ID:</strong> {typeof window !== 'undefined' ? localStorage.getItem('guest_session_id') : 'Loading...'}</p>
        </div>

        {/* Instructions */}
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open browser DevTools console</li>
            <li>Click "Test Add to Cart" to add a test item</li>
            <li>Watch the console logs with 🛒 emojis</li>
            <li>Check if the cart state updates above</li>
            <li>Go back to the main site and check the header cart badge</li>
          </ol>
        </div>
      </div>
    </div>
  );
}