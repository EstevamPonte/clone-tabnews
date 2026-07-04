import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForallServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonumous user", () => {
    describe("Running pending migrtions", () => {
      test("For the first tima", async () => {
        const response1 = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );

        expect(response1.status).toBe(403);

        const response1Body = await response1.json();

        expect(response1Body).toEqual({
          name: "ForbiddenError",
          message: "Você não possui permissão para executar esta ação.",
          action:
            'Verifique se o seu usuário possui a feature "create:migration"',
          status_code: 403,
        });
      });
    });
  });

  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const createUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
        method: "POST",
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action:
          'Verifique se o seu usuário possui a feature "create:migration"',
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("With 'create:migration'", async () => {
      const createUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createUser);
      await orchestrator.addFeaturesToUser(createUser, ["create:migration"]);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
        method: "POST",
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
