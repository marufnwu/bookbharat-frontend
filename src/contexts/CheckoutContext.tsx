'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cartApi, orderApi, paymentApi } from '@/lib/api';
import { useCartStore } from '@/stores/cart';
import { taxService, TaxCalculationResponse } from '@/services/taxService';

// Types
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  email: string;
}

export interface BillingAddress {
  billing_firstName: string;
  billing_lastName: string;
  billing_phone: string;
  billing_address_line_1: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'online' | 'cod';
  description?: string;
  icon?: string;
  charges?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  processing_time?: string;
  secure?: boolean;
}

export interface CheckoutState {
  currentStep: number;
  shippingAddress: ShippingAddress | null;
  billingAddress: BillingAddress | null;
  sameAsBilling: boolean;
  selectedPaymentMethod: PaymentMethod | null;
  isProcessing: boolean;
  error: string | null;
  errorType: 'payment' | 'shipping' | 'inventory' | 'network' | 'validation' | 'general';
  orderData: any | null;
  shippingCost: number;
  estimatedDelivery: string;
  retryCount: number;
  taxCalculation: TaxCalculationResponse | null;
  isCalculatingTax: boolean;
  taxError: string | null;
}

// Actions
type CheckoutAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_SHIPPING_ADDRESS'; payload: ShippingAddress }
  | { type: 'SET_BILLING_ADDRESS'; payload: BillingAddress | null }
  | { type: 'SET_SAME_AS_BILLING'; payload: boolean }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ERROR_TYPE'; payload: 'payment' | 'shipping' | 'inventory' | 'network' | 'validation' | 'general' }
  | { type: 'SET_ORDER_DATA'; payload: any }
  | { type: 'SET_SHIPPING_COST'; payload: number }
  | { type: 'SET_ESTIMATED_DELIVERY'; payload: string }
  | { type: 'SET_RETRY_COUNT'; payload: number }
  | { type: 'SET_TAX_CALCULATION'; payload: TaxCalculationResponse | null }
  | { type: 'SET_CALCULATING_TAX'; payload: boolean }
  | { type: 'SET_TAX_ERROR'; payload: string | null }
  | { type: 'RESET_CHECKOUT' }
  | { type: 'RESTORE_STATE'; payload: Partial<CheckoutState> };

// Initial state
const initialState: CheckoutState = {
  currentStep: 1,
  shippingAddress: null,
  billingAddress: null,
  sameAsBilling: true,
  selectedPaymentMethod: null,
  isProcessing: false,
  error: null,
  errorType: 'general',
  orderData: null,
  shippingCost: 0,
  estimatedDelivery: '2-4 business days',
  retryCount: 0,
  taxCalculation: null,
  isCalculatingTax: false,
  taxError: null,
};

// Reducer
const checkoutReducer = (state: CheckoutState, action: CheckoutAction): CheckoutState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_SHIPPING_ADDRESS':
      return { ...state, shippingAddress: action.payload };
    case 'SET_BILLING_ADDRESS':
      return { ...state, billingAddress: action.payload };
    case 'SET_SAME_AS_BILLING':
      return { ...state, sameAsBilling: action.payload };
    case 'SET_PAYMENT_METHOD':
      return { ...state, selectedPaymentMethod: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        // Reset retry count when new error occurs
        retryCount: action.payload ? state.retryCount : 0
      };
    case 'SET_ERROR_TYPE':
      return { ...state, errorType: action.payload };
    case 'SET_ORDER_DATA':
      return { ...state, orderData: action.payload };
    case 'SET_SHIPPING_COST':
      return { ...state, shippingCost: action.payload };
    case 'SET_ESTIMATED_DELIVERY':
      return { ...state, estimatedDelivery: action.payload };
    case 'SET_RETRY_COUNT':
      return { ...state, retryCount: action.payload };
    case 'SET_TAX_CALCULATION':
      return { ...state, taxCalculation: action.payload, taxError: null };
    case 'SET_CALCULATING_TAX':
      return { ...state, isCalculatingTax: action.payload };
    case 'SET_TAX_ERROR':
      return { ...state, taxError: action.payload, taxCalculation: null };
    case 'RESET_CHECKOUT':
      return initialState;
    case 'RESTORE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Context
interface CheckoutContextType {
  state: CheckoutState;
  dispatch: React.Dispatch<CheckoutAction>;
  moveToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  submitShippingAddress: (data: any) => Promise<void>;
  selectPaymentMethod: (method: PaymentMethod) => void;
  placeOrder: () => Promise<void>;
  resetCheckout: () => void;
  retryOrder: () => Promise<void>;
  clearError: () => void;
  setError: (error: string, type?: CheckoutState['errorType']) => void;
  saveCartForLater: () => Promise<void>;
  contactSupport: (orderData?: any) => void;
  calculateTaxes: () => Promise<void>;
  clearTaxError: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// Provider component
interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const router = useRouter();
  const { cartItems, subtotal, clearCart } = useCartStore();

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        currentStep: state.currentStep,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        sameAsBilling: state.sameAsBilling,
        selectedPaymentMethod: state.selectedPaymentMethod,
        shippingCost: state.shippingCost,
        estimatedDelivery: state.estimatedDelivery,
      };
      localStorage.setItem('checkoutState', JSON.stringify(stateToSave));
    }
  }, [state]);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('checkoutState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          dispatch({ type: 'RESTORE_STATE', payload: parsed });
        } catch (error) {
          console.error('Failed to restore checkout state:', error);
        }
      }
    }
  }, []);

  // Track user behavior for cart abandonment detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionId = getSessionId();
      let sessionStartTime = Date.now();
      let lastActivityTime = Date.now();

      // Generate session ID if not exists
      function getSessionId(): string {
        let sessionId = sessionStorage.getItem('checkout_session_id');
        if (!sessionId) {
          sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('checkout_session_id', sessionId);
        }
        return sessionId;
      }

      // Track exit intent
      const handleExitIntent = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          trackUserBehavior({
            exit_intent_detected: true,
            session_duration: Math.floor((Date.now() - sessionStartTime) / 1000),
            time_on_page: Math.floor((Date.now() - lastActivityTime) / 1000),
          });
        }
      };

      // Track page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // User left the page
          trackUserBehavior({
            session_duration: Math.floor((Date.now() - sessionStartTime) / 1000),
            time_on_page: Math.floor((Date.now() - lastActivityTime) / 1000),
          });
        } else {
          // User returned to the page
          lastActivityTime = Date.now();
        }
      };

      // Track scroll depth
      let maxScrollDepth = 0;
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        const scrollDepth = Math.min(100, Math.round((currentScroll / scrollHeight) * 100));

        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
        }

        lastActivityTime = Date.now();
      };

      // Track device type
      const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
      };

      // Track user behavior function
      async function trackUserBehavior(data: any) {
        try {
          await cartApi.trackUserBehavior({
            session_id: sessionId,
            device_type: getDeviceType(),
            scroll_depth: maxScrollDepth,
            ...data,
          });
        } catch (error) {
          // Silently fail to not disrupt user experience
          console.warn('Failed to track user behavior:', error);
        }
      }

      // Track initial session start
      trackUserBehavior({
        session_duration: 0,
        time_on_page: 0,
      });

      // Add event listeners
      document.addEventListener('mouseleave', handleExitIntent);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('scroll', handleScroll, { passive: true });

      // Track behavior every 30 seconds
      const interval = setInterval(() => {
        trackUserBehavior({
          session_duration: Math.floor((Date.now() - sessionStartTime) / 1000),
          time_on_page: Math.floor((Date.now() - lastActivityTime) / 1000),
        });
      }, 30000);

      // Cleanup
      return () => {
        document.removeEventListener('mouseleave', handleExitIntent);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('scroll', handleScroll);
        clearInterval(interval);

        // Track session end
        trackUserBehavior({
          session_duration: Math.floor((Date.now() - sessionStartTime) / 1000),
          time_on_page: Math.floor((Date.now() - lastActivityTime) / 1000),
        });
      };
    }
  }, []);

  // Clear state when leaving checkout
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.location.pathname !== '/checkout') {
        localStorage.removeItem('checkoutState');
      }
    };
  }, []);

  // Auto-calculate taxes when shipping address, cart items, or shipping cost changes
  useEffect(() => {
    if (state.shippingAddress && cartItems && cartItems.length > 0 && state.currentStep >= 1) {
      // Add a small delay to avoid too many API calls
      const timer = setTimeout(() => {
        calculateTaxes();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [state.shippingAddress?.state, state.shippingAddress?.postal_code, cartItems?.length || 0, state.shippingCost]);

  const moveToStep = (step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
    if (typeof window !== 'undefined') {
      const hash = step === 1 ? '#shipping' : step === 2 ? '#payment' : '#review';
      window.history.replaceState(null, '', hash);
    }
  };

  const nextStep = () => {
    if (state.currentStep < 3) {
      moveToStep(state.currentStep + 1);
    }
  };

  const previousStep = () => {
    if (state.currentStep > 1) {
      moveToStep(state.currentStep - 1);
    }
  };

  const submitShippingAddress = async (data: any) => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { shippingData, sameAsBilling, billingAddress } = data;

      // Calculate shipping cost based on address
      const shippingResponse = await cartApi.calculateShipping(shippingData.postal_code);
      dispatch({ type: 'SET_SHIPPING_COST', payload: shippingResponse.shipping_cost || 0 });
      dispatch({ type: 'SET_ESTIMATED_DELIVERY', payload: shippingResponse.estimated_delivery || '2-4 business days' });

      // Set addresses
      dispatch({ type: 'SET_SHIPPING_ADDRESS', payload: shippingData });
      dispatch({ type: 'SET_SAME_AS_BILLING', payload: sameAsBilling });

      if (!sameAsBilling && billingAddress) {
        dispatch({ type: 'SET_BILLING_ADDRESS', payload: billingAddress });
      }

      nextStep();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to save shipping address' });
      toast.error('Failed to save shipping address');
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
    nextStep();
  };

  const placeOrder = async () => {
    if (!state.shippingAddress || !state.selectedPaymentMethod) {
      setError('Missing required information', 'validation');
      return;
    }

    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      clearError();

      const orderData = {
        shipping_address: state.shippingAddress,
        billing_address: state.sameAsBilling ? null : state.billingAddress,
        payment_method: state.selectedPaymentMethod.id,
        items: cartItems,
        subtotal,
        shipping_cost: state.shippingCost,
        total_amount: subtotal + state.shippingCost,
      };

      const response = await orderApi.createOrder(orderData);
      dispatch({ type: 'SET_ORDER_DATA', payload: response });

      // For COD orders, redirect to success page immediately
      if (state.selectedPaymentMethod.type === 'cod') {
        clearCart();
        router.push('/payment/success?order_id=' + response.order_number);
        return;
      }

      // For online payments, redirect to payment gateway
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        throw new Error('Payment URL not received');
      }

    } catch (error: any) {
      // Intelligent error classification
      const errorMessage = error.message || 'Failed to place order';
      let errorType: CheckoutState['errorType'] = 'general';

      if (error.message) {
        const lowerMessage = error.message.toLowerCase();

        if (lowerMessage.includes('payment') || lowerMessage.includes('card') || lowerMessage.includes('gateway')) {
          errorType = 'payment';
        } else if (lowerMessage.includes('shipping') || lowerMessage.includes('address') || lowerMessage.includes('delivery')) {
          errorType = 'shipping';
        } else if (lowerMessage.includes('stock') || lowerMessage.includes('inventory') || lowerMessage.includes('unavailable')) {
          errorType = 'inventory';
        } else if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('timeout')) {
          errorType = 'network';
        } else if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
          errorType = 'validation';
        }
      }

      // Check for specific error status codes if available
      if (error.response?.status) {
        switch (error.response.status) {
          case 400:
            errorType = 'validation';
            break;
          case 402:
            errorType = 'payment';
            break;
          case 409:
            errorType = 'inventory';
            break;
          case 503:
          case 502:
          case 504:
            errorType = 'network';
            break;
        }
      }

      setError(errorMessage, errorType);
      toast.error(`${errorType === 'payment' ? 'Payment' : 'Order'} failed. ${getSuggestedAction(errorType)}`);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Enhanced error recovery methods
  const retryOrder = async () => {
    if (state.retryCount >= 3) {
      setError('Maximum retry attempts reached. Please try a different approach or contact support.', 'general');
      return;
    }

    dispatch({ type: 'SET_RETRY_COUNT', payload: state.retryCount + 1 });
    await placeOrder();
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const setError = (error: string, type: CheckoutState['errorType'] = 'general') => {
    dispatch({ type: 'SET_ERROR', payload: error });
    dispatch({ type: 'SET_ERROR_TYPE', payload: type });
  };

  const getSuggestedAction = (errorType: CheckoutState['errorType']): string => {
    switch (errorType) {
      case 'payment':
        return 'Please try a different payment method or check your card details.';
      case 'shipping':
        return 'Please verify your shipping address and try again.';
      case 'inventory':
        return 'Some items may be out of stock. Please review your cart.';
      case 'network':
        return 'Please check your connection and try again.';
      case 'validation':
        return 'Please check all required fields and try again.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  };

  const saveCartForLater = async () => {
    try {
      // Implementation would depend on your cart API
      toast.success('Cart saved! You can continue shopping later.');
      router.push('/cart');
    } catch (error) {
      toast.error('Failed to save cart. Please try again.');
    }
  };

  const contactSupport = (orderData?: any) => {
    const subject = orderData?.order_number
      ? `Order Issue - #${orderData.order_number}`
      : 'Checkout Issue';

    const body = `I'm having trouble with my order.
Error: ${state.error}
Error Type: ${state.errorType}
Order Reference: ${orderData?.order_number || 'N/A'}
Time: ${new Date().toISOString()}`;

    // Open email client or redirect to support page
    window.location.href = `mailto:support@bookbharat.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const calculateTaxes = async () => {
    if (!state.shippingAddress || cartItems.length === 0) {
      return;
    }

    try {
      dispatch({ type: 'SET_CALCULATING_TAX', payload: true });
      dispatch({ type: 'SET_TAX_ERROR', payload: null });

      // Prepare items for tax calculation
      const taxItems = cartItems.map(item => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        tax_category: item.tax_category || undefined,
        hsn_code: item.hsn_code || undefined,
      }));

      const taxRequest = {
        items: taxItems,
        shipping_cost: state.shippingCost,
        state: state.shippingAddress.state,
        is_inter_state: false, // TODO: Determine based on shipping address vs business location
        pincode: state.shippingAddress.postal_code,
      };

      // Validate request
      const validation = taxService.validateTaxRequest(taxRequest);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const taxResponse = await taxService.calculateCartTax(taxRequest);

      if (taxResponse.success && taxResponse.data) {
        dispatch({ type: 'SET_TAX_CALCULATION', payload: taxResponse });
      } else {
        throw new Error(taxResponse.message || 'Failed to calculate taxes');
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to calculate taxes';
      dispatch({ type: 'SET_TAX_ERROR', payload: errorMessage });

      // Use local calculation as fallback
      try {
        const fallbackRequest = {
          items: cartItems.map(item => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            tax_category: item.tax_category || undefined,
            hsn_code: item.hsn_code || undefined,
          })),
          shipping_cost: state.shippingCost,
          state: state.shippingAddress.state,
          is_inter_state: false,
          pincode: state.shippingAddress.postal_code,
        };

        const fallbackResponse = taxService.calculateTaxLocally(fallbackRequest);
        dispatch({ type: 'SET_TAX_CALCULATION', payload: fallbackResponse });

        toast.warning('Using estimated tax calculation. Final taxes will be calculated at checkout.');
      } catch (fallbackError) {
        // If even fallback fails, just clear the error and continue
        dispatch({ type: 'SET_TAX_CALCULATION', payload: null });
        toast.error('Unable to calculate taxes. Taxes will be calculated at checkout.');
      }
    } finally {
      dispatch({ type: 'SET_CALCULATING_TAX', payload: false });
    }
  };

  const clearTaxError = () => {
    dispatch({ type: 'SET_TAX_ERROR', payload: null });
  };

  const resetCheckout = () => {
    dispatch({ type: 'RESET_CHECKOUT' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('checkoutState');
    }
  };

  const value: CheckoutContextType = {
    state,
    dispatch,
    moveToStep,
    nextStep,
    previousStep,
    submitShippingAddress,
    selectPaymentMethod,
    placeOrder,
    resetCheckout,
    retryOrder,
    clearError,
    setError,
    saveCartForLater,
    contactSupport,
    calculateTaxes,
    clearTaxError,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

// Hook
export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export default CheckoutProvider;