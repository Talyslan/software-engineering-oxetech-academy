import { Router } from "express";
import { createHealthModule } from "../../composition/create-health-module.js";
import { routeHandler } from "../../http/route-handler.js";

const { controller } = createHealthModule();
const router = Router();

router.get(
  "/",
  routeHandler((request, response) =>
    controller.index(request, response),
  ),
);

export { router as healthRouter };
