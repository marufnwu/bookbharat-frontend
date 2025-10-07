# Payment Visibility Frontend Update

## File to Update
`src/app/checkout/page.tsx`

## Lines to Replace: 582-618

### OLD CODE (Remove this):
```typescript
        // Separate COD from online payment methods
        console.log('🔍 All gateways received:', gateways);
        console.log('🎛️ Payment flow settings:', response.payment_flow);
        const codGateway = gateways.find((g: any) => g.gateway && g.gateway.includes('cod'));
        console.log('💰 COD Gateway found:', codGateway);
        const onlineGateways = gateways.filter((g: any) => !g.gateway || !g.gateway.includes('cod'));

        // Transform online gateways only
        const methods = onlineGateways.map((gateway: any) => ({
          payment_method: gateway.gateway,
          display_name: gateway.display_name || gateway.name,
          description: gateway.description || '',
          priority: gateway.priority || 0
        }));
        setAvailablePaymentMethods(methods);

        // Store COD configuration separately
        // Check both: COD gateway exists AND admin has enabled COD visibility
        const isCodEnabled = response.payment_flow?.cod_enabled !== false; // Default to true if not specified
        console.log('🔒 Admin COD enabled setting:', isCodEnabled);

        if (codGateway && codGateway.is_active !== false && isCodEnabled) {
          const config = {
            enabled: true,
            display_name: codGateway.display_name || 'Cash on Delivery',
            description: codGateway.description || 'Pay when your order arrives',
            advance_payment: codGateway.advance_payment || null,
            service_charges: codGateway.service_charges || null
          };
          console.log('✅ Setting COD config:', config);
          setCodConfig(config);
          setCodAvailable(true);
        } else {
          console.log('❌ COD not available - codGateway:', codGateway, 'adminEnabled:', isCodEnabled);
          setCodConfig(null);
          setCodAvailable(false);
        }
```

### NEW CODE (Replace with this):
```typescript
        // NEW CONSOLIDATED API: payment_methods array contains ALL enabled methods
        // Backend filters by PaymentConfiguration.is_enabled (single source of truth)
        console.log('🔍 Payment methods received:', response.payment_methods);
        console.log('🎛️ Payment flow settings:', response.payment_flow);

        // Separate COD from online payment methods using is_cod flag
        const codMethods = response.payment_methods?.filter((m: any) => m.is_cod) || [];
        const onlineMethods = response.payment_methods?.filter((m: any) => m.is_online) || [];

        console.log('💰 COD methods:', codMethods);
        console.log('💳 Online methods:', onlineMethods);

        // Set online payment methods
        setAvailablePaymentMethods(onlineMethods);

        // Handle COD configuration (use first COD method if multiple exist)
        if (codMethods.length > 0) {
          const codMethod = codMethods[0]; // Use first enabled COD method
          const config = {
            enabled: true,
            display_name: codMethod.display_name,
            description: codMethod.description,
            advance_payment: codMethod.configuration?.advance_payment || null,
            service_charges: codMethod.configuration?.service_charges || null
          };
          console.log('✅ Setting COD config:', config);
          setCodConfig(config);
          setCodAvailable(true);
        } else {
          console.log('❌ No COD methods available from backend');
          setCodConfig(null);
          setCodAvailable(false);
        }
```

## What Changed?

1. **Old API**: Used `response.gateways` and checked `response.payment_flow.cod_enabled`
2. **New API**: Uses `response.payment_methods` with `is_cod` and `is_online` flags
3. **Single Source of Truth**: Backend now controls visibility via `PaymentConfiguration.is_enabled`

## Manual Steps:

1. Open `src/app/checkout/page.tsx` in your editor
2. Find line 582 (search for "Separate COD from online payment methods")
3. Select lines 582-618
4. Delete them
5. Paste the NEW CODE above
6. Save the file

## After Update:

Run the development server to test:
```bash
npm run dev
```

Navigate to checkout and verify payment methods load correctly.
