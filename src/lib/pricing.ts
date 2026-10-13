// Example plans for planning purposes. Prices and features are placeholders
// to be confirmed before any plan is offered for purchase. Edit here; the
// pricing page, homepage preview, and checkout endpoint all read from this file.

export interface Plan {
  id: 'personal' | 'business' | 'professional' | 'enterprise';
  name: string;
  /** Monthly price in USD, or null for custom pricing. */
  monthlyPrice: number | null;
  summary: string;
  features: string[];
  /** Name of the environment variable that holds the Stripe Price ID for this plan. */
  stripePriceEnv: string | null;
  highlighted?: boolean;
}

export const FREE_TIER = {
  name: 'Free Scan',
  price: '$0',
  summary: 'A preliminary look at publicly available information about you or your business.',
  features: [
    'Basic reputation scan',
    'Basic reputation score',
    'General recommendations',
    'No credit card required'
  ]
};

export const PLANS: Plan[] = [
  {
    id: 'personal',
    name: 'Personal',
    monthlyPrice: 29,
    summary: 'Ongoing monitoring for an individual professional or public-facing person.',
    features: [
      'Reputation monitoring for your name',
      'Monthly reputation report',
      'Reputation alerts',
      'Improvement recommendations'
    ],
    stripePriceEnv: 'STRIPE_PRICE_PERSONAL_MONTHLY'
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 79,
    summary: 'Monitoring for a small business, practice, or local company.',
    features: [
      'Business reputation monitoring',
      'Review monitoring',
      'Monthly reports',
      'Multiple keywords and brand terms',
      'Priority support'
    ],
    stripePriceEnv: 'STRIPE_PRICE_BUSINESS_MONTHLY',
    highlighted: true
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 199,
    summary: 'Deeper monitoring and reporting for agencies and multi-location organizations.',
    features: [
      'Advanced monitoring',
      'Multiple brand keywords',
      'Detailed reports',
      'Competitor monitoring',
      'Priority support'
    ],
    stripePriceEnv: 'STRIPE_PRICE_PROFESSIONAL_MONTHLY'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    summary: 'Custom scope, volume, and reporting for larger organizations.',
    features: [
      'Custom monitoring scope',
      'Dedicated account review',
      'Custom reporting and integrations',
      'Contract and invoicing options'
    ],
    stripePriceEnv: null
  }
];

export const PRICING_NOTE =
  'Prices are examples for planning and may change. Paid plans are not available for purchase yet. Choosing a plan today starts a conversation, not a charge.';
