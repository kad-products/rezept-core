export type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
} | null;