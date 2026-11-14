import { createSafeActionClient } from "next-safe-action";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export const action = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof Error && e.name === "ActionError") {
      return e.message;
    }

    console.error("Action error:", e);
    return "Une erreur est survenue lors de l'exécution de cette action";
  },
}).use(async ({ next }) => {
  const result = await next();

  if (result.validationErrors) {
    console.error("Validation errors in action:", result.validationErrors);
  }
  if (result.serverError) {
    console.error("Server error in action:", result.serverError);
  }

  return result;
});
