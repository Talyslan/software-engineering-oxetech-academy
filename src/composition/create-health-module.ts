import { HealthController } from "../features/health/health.controller.js";
import { HealthService } from "../features/health/health.service.js";

export function createHealthModule() {
  const service = new HealthService();
  const controller = new HealthController(service);

  return {
    controller,
    service,
  };
}
