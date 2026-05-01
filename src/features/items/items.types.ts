import type { Timestamp } from 'firebase/firestore';
import type { Unit } from '../../lib/units';

export type Item = {
  id: string;
  name: string;
  purchaseDate: Timestamp;
  unit: Unit;
  totalQuantity: number;
  totalPrice: number;
  unitPrice: number;
  consumedQuantity: number;
  remainingQuantity: number;
  remainingValue: number;
  note: string | null;
  archived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ItemDraft = {
  name: string;
  purchaseDate: Date;
  unit: Unit;
  totalQuantity: number;
  totalPrice: number;
  note?: string;
};
