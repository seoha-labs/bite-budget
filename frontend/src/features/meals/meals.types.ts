import type { Timestamp } from 'firebase/firestore';

export type MealLabel = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export type Consumption = {
  itemId: string;
  itemNameSnapshot: string;
  unitSnapshot: string;
  consumedQuantity: number;
  unitPriceSnapshot: number;
  costShare: number;
};

export type Meal = {
  id: string;
  eatenAt: Timestamp;
  label: MealLabel;
  note: string | null;
  consumptions: Consumption[];
  itemIds: string[];
  totalCost: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ConsumptionDraft = {
  itemId: string;
  consumedQuantity: number;
};

export type MealDraft = {
  eatenAt: Date;
  label: MealLabel;
  note?: string;
  consumptions: ConsumptionDraft[];
};
