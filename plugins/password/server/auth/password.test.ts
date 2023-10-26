import { faker } from "@faker-js/faker";
import ResetPasswordEmail from "@server/emails/templates/ResetPasswordEmail";
import { buildUser, buildTeam } from "@server/test/factories";
import { getTestServer } from "@server/test/support";

const server = getTestServer();

describe("password", () => {
  it("should require email param", async () => {
    const res = await server.post("/auth/password", {
      body: { password: "password" },
    });
    const body = await res.json();
    expect(res.status).toEqual(400);
    expect(body.error).toEqual("validation_error");
    expect(body.ok).toEqual(false);
  });

  it("should require password param", async () => {
    const res = await server.post("/auth/password", {
      body: { email: faker.internet.email() },
    });
    const body = await res.json();
    expect(res.status).toEqual(400);
    expect(body.error).toEqual("param_required");
    expect(body.ok).toEqual(false);
  });

  it("should respond with success and email to be sent when user requests a new password", async () => {
    const spy = jest.spyOn(ResetPasswordEmail.prototype, "schedule");
    const subdomain = faker.internet.domainWord();
    const team = await buildTeam({ subdomain });
    const user = await buildUser({ teamId: team.id });

    const res = await server.post("/auth/password.reset", {
      body: {
        email: user.email,
      },
    });
    expect(res.status).toEqual(200);
    expect(res.redirected).toEqual(true);
    expect(res.url).toContain("password-reset-success");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("should respond with success and email not sent when unknown email address requests a new password", async () => {
    const spy = jest.spyOn(ResetPasswordEmail.prototype, "schedule");

    const res = await server.post("/auth/password.reset", {
      body: {
        email: "unknown@mail.org",
      },
    });
    expect(res.status).toEqual(200);
    expect(res.redirected).toEqual(true);
    expect(res.url).toContain("password-reset-failed");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  /* it("should respond with success regardless of whether successful to prevent crawling email logins", async () => {
    const spy = jest.spyOn(WelcomeEmail.prototype, "schedule");
    const subdomain = faker.internet.domainWord();
    await buildTeam({ subdomain });
    const res = await server.post("/auth/email", {
      body: {
        email: "user@example.com",
      },
      headers: {
        host: `${subdomain}.outline.dev`,
      },
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.success).toEqual(true);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });*/
});
