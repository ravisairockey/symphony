import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SPRING_CONFIG = {
  card: { type: "spring" as const, stiffness: 300, damping: 30 },
  button: { type: "spring" as const, stiffness: 400, damping: 25 },
  modal: { type: "spring" as const, stiffness: 350, damping: 28 },
  gentle: { type: "spring" as const, stiffness: 200, damping: 25 },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
