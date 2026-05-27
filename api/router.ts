import { authRouter } from "./auth-router";
import { budgetRouter } from "./budget-router";
import { planningRouter } from "./planning-router";
import { recruitmentRouter } from "./recruitment-router";
import { doctorsRouter } from "./doctors-router";
import { projectsRouter } from "./projects-router";
import { systemRouter } from "./system-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  budget: budgetRouter,
  planning: planningRouter,
  recruitment: recruitmentRouter,
  doctors: doctorsRouter,
  projects: projectsRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;
