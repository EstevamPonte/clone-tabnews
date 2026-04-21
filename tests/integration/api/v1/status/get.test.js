import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForallServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonumous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(responseBody.dependencies.database).not.toHaveProperty("version");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });

  describe("Privileged user", () => {
    test("Retrieving pending migrations", async () => {
      const createUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createUser);
      await orchestrator.addFeaturesToUser(createUser, ["read:status:all"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(responseBody.dependencies.database.version).toEqual("16.0");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
