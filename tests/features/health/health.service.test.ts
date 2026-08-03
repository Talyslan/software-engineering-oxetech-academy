import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(),
  },
}));

vi.mock("../../../src/utils/app-start-time.js", () => ({
  getUptimeSeconds: vi.fn(() => 42),
}));

import fs from "node:fs";
import { HealthService } from "../../../src/features/health/health.service.js";

describe("HealthService", () => {
  const service = new HealthService();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-28T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("retorna status ok com timestamp, uptime e database reachable", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const status = service.getStatus();

    expect(status).toMatchObject({
      status: "ok",
      service: "oxetech-helpdesk",
      timestamp: "2026-06-28T12:00:00.000Z",
      uptime: 42,
      database: "reachable",
    });
  });

  it("indica database missing quando arquivo nao existe", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(service.getStatus().database).toBe("missing");
  });
});
