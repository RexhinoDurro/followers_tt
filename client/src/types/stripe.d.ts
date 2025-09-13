// 3. Create client/src/types/stripe.d.ts
declare global {
  interface Window {
    Stripe: any;
  }
}

export {};
