'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import { useCartSummary } from '@/hooks/useCartSummary';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  ShoppingCart,
  ArrowLeft,
  X,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const [updating, setUpdating] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const { cart, isLoading, getCart, updateQuantity, removeItem } = useCartStore();
  const cartSummary = useCartSummary(cart);

  useEffect(() => {
    getCart();
  }, [getCart]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    setUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setRemoving(itemId);
    try {
      await removeItem(itemId);
      toast.success('Removed from cart');
    } finally {
      setRemoving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3">
          <Link href="/products"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-semibold">Cart</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add books to get started</p>
          <Button asChild className="w-full max-w-xs">
            <Link href="/products">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link href="/products"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-lg font-semibold">Cart</h1>
            <p className="text-xs text-gray-500">{cart.total_items} items</p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {cart.items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex gap-3">
              {/* Image */}
              <div className="w-20 h-24 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                {item.product?.images?.[0]?.url ? (
                  <Image
                    src={item.product.images[0].image_url || images[0].url}
                    alt={item.product.name}
                    width={80}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2 mb-1">
                  {item.product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {item.product.author || 'Unknown'}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-bold">₹{item.product.price}</span>
                  {item.product.compare_price > item.product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{item.product.compare_price}
                    </span>
                  )}
                </div>

                {/* Quantity & Remove */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-gray-100 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={updating === item.id}
                      className="p-2 disabled:opacity-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-sm font-medium min-w-[40px] text-center">
                      {updating === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                      className="p-2 disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removing === item.id}
                    className="p-2 text-red-500"
                  >
                    {removing === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        {/* Summary Toggle */}
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="w-full px-4 py-3 flex items-center justify-between border-b"
        >
          <div className="text-left">
            <p className="text-xs text-gray-500">Total ({cart.total_items} items)</p>
            <p className="text-xl font-bold">₹{cartSummary.total.toFixed(0)}</p>
          </div>
          {showSummary ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {/* Expandable Summary */}
        {showSummary && (
          <div className="px-4 py-3 space-y-2 text-sm border-b">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{cartSummary.subtotal.toFixed(2)}</span>
            </div>
            {cartSummary.couponDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{cartSummary.couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>₹{cartSummary.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>₹{cartSummary.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <div className="p-4">
          <Button asChild className="w-full h-12 text-base">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}