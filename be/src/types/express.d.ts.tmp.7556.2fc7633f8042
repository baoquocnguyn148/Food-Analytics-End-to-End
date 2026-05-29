import { Role } from "../utils/jwt";

// Augment Express Request with the authenticated user (set by auth.middleware).
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: Role;
      };
    }
  }
}

export {};
