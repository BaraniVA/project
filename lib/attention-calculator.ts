export interface AttentionValueParams {
  monthlySalary?: number;
  productiveHoursPerMonth?: number;
  personalFocusRatio?: number;
  platformProfitWeight?: number;
}

export const APP_PROFIT_WEIGHTS = {
  'TikTok': 1.8,
  'Instagram': 1.6,
  'YouTube': 1.4,
  'Facebook': 1.5,
  'Twitter': 1.3,
  'Snapchat': 1.4,
  'Netflix': 0.8,
  'WhatsApp': 0.3,
  'Reddit': 1.2,
  'Discord': 0.5,
} as const;

export function calculateAttentionValue({
  monthlySalary = 30000,
  productiveHoursPerMonth = 160,
  personalFocusRatio = 0.6,
  platformProfitWeight = 1.0,
}: AttentionValueParams = {}): number {
  const baseHourlyValue = monthlySalary / productiveHoursPerMonth;
  return baseHourlyValue * personalFocusRatio * platformProfitWeight;
}

export function calculateTimeLoss(appName: string, hours: number): number {
  const profitWeight = APP_PROFIT_WEIGHTS[appName as keyof typeof APP_PROFIT_WEIGHTS] || 1.0;
  const hourlyValue = calculateAttentionValue({ platformProfitWeight: profitWeight });
  return hourlyValue * hours;
}

export function calculateCorporateProfit(appName: string, hours: number): number {
  // Estimated corporate profit per hour based on advertising revenue
  const corporateProfitRates = {
    'TikTok': 145,
    'Instagram': 130,
    'YouTube': 120,
    'Facebook': 125,
    'Twitter': 90,
    'Snapchat': 85,
    'Netflix': 40,
    'WhatsApp': 15,
    'Reddit': 75,
    'Discord': 25,
  } as const;

  const rate = corporateProfitRates[appName as keyof typeof corporateProfitRates] || 50;
  return rate * hours;
}

export function calculateSubscriptionROI(cost: number, usageHours: number): {
  costPerHour: number;
  isWorthwhile: boolean;
  suggestion: string;
} {
  const costPerHour = usageHours > 0 ? cost / usageHours : cost;
  const isWorthwhile = costPerHour < 50; // Arbitrary threshold
  
  let suggestion = '';
  if (!isWorthwhile) {
    suggestion = `At ₹${costPerHour.toFixed(0)}/hour, consider reducing usage or finding alternatives.`;
  } else {
    suggestion = `Good value at ₹${costPerHour.toFixed(0)}/hour of entertainment.`;
  }

  return { costPerHour, isWorthwhile, suggestion };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateFocusPoints(activityType: string, hours: number): number {
  const pointRates = {
    'study': 100,
    'exercise': 80,
    'work': 90,
    'creative': 85,
    'reading': 70,
    'meditation': 60,
    'skill_building': 95,
  } as const;

  const rate = pointRates[activityType as keyof typeof pointRates] || 50;
  return rate * hours;
}