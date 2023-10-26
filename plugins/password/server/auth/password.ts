import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import Router from "koa-router";
import randomstring from "randomstring";
import { Client } from "@shared/types";
import accountProvisioner from "@server/commands/accountProvisioner";
import ResetPasswordEmail from "@server/emails/templates/ResetPasswordEmail";
import env from "@server/env";
import { rateLimiter } from "@server/middlewares/rateLimiter";
import { User } from "@server/models";
import { RateLimiterStrategy } from "@server/utils/RateLimiter";
import { signIn } from "@server/utils/authentication";
import { getUserForPasswordResetToken } from "@server/utils/jwt";
import { assertEmail, assertPresent } from "@server/validation";

const router = new Router();

const AUTH_PROVIDER_NAME = "password";

if (env.LOCAL_ADMIN_EMAIL && env.LOCAL_ADMIN_PASSWORD) {
  router.post(
    "password",
    rateLimiter(RateLimiterStrategy.TenPerHour),
    async (ctx) => {
      const { email, password, client } = ctx.request.body;
      assertEmail(email, "email is required");
      assertPresent(password, "password is required");

      const user = await User.scope([
        "withAuthentications",
        "withTeam",
      ]).findOne({
        where: { email: email.toLowerCase() },
      });

      const localUserAuth = user?.authentications.find(
        (auth) => auth.authenticationProvider.name === AUTH_PROVIDER_NAME
      );

      if (user && localUserAuth) {
        const storedPasswordHash = localUserAuth.accessToken;

        if (user.isSuspended) {
          return ctx.redirect("/?notice=suspended");
        }

        if (await bcrypt.compare(password, storedPasswordHash)) {
          return await signIn(ctx, "password", {
            user,
            team: user.team,
            isNewTeam: false,
            isNewUser: false,
            client: client === Client.Desktop ? Client.Desktop : Client.Web,
          });
        }

        return ctx.redirect(`/?notice=auth-error`);
      }

      if (
        env.LOCAL_ADMIN_EMAIL !== email ||
        env.LOCAL_ADMIN_PASSWORD !== password
      ) {
        return ctx.redirect(`/?notice=auth-error`);
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      const result = await accountProvisioner({
        ip: ctx.ip,
        team: {
          domain: env.URL,
          name: env.APP_NAME,
          subdomain: "wiki",
        },
        user: {
          email,
          name: email,
        },
        authenticationProvider: {
          name: AUTH_PROVIDER_NAME,
          providerId: env.URL,
        },
        authentication: {
          providerId: email,
          accessToken: passwordHash,
          scopes: [],
        },
      });

      await signIn(ctx, AUTH_PROVIDER_NAME, {
        user: result.user,
        team: result.team,
        isNewTeam: result.isNewTeam,
        isNewUser: result.isNewUser,
        client: client === Client.Desktop ? Client.Desktop : Client.Web,
      });
    }
  );

  router.post(
    "password.reset",
    rateLimiter(RateLimiterStrategy.TenPerHour),
    async (ctx) => {
      const { email } = ctx.request.body;
      assertEmail(email, "email is required");

      const user = await User.scope().findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user || user.isSuspended) {
        return ctx.redirect("/?notice=password-reset-failed");
      }

      const passwordAuth = user.authentications.find(
        (it) => it.authenticationProvider.name === AUTH_PROVIDER_NAME
      );

      if (!passwordAuth) {
        return ctx.redirect("/?notice=password-reset-failed");
      }

      passwordAuth.refreshToken = JWT.sign(
        {
          id: user.id,
          createdAt: new Date().toISOString(),
          type: "password-reset",
        },
        randomstring.generate(32)
      );

      await passwordAuth.save();
      await new ResetPasswordEmail({
        to: user.email,
        token: passwordAuth.refreshToken,
        userName: user.name,
      }).schedule();

      return ctx.redirect(`/?notice=password-reset-success`);
    }
  );

  router.get("password.callback", async (ctx) => {
    const { token } = ctx.request.query;
    assertPresent(token, "token is required");

    let user!: User;

    try {
      user = await getUserForPasswordResetToken(token as string);
    } catch (err) {
      ctx.redirect(`/?notice=expired-token`);
      return;
    }

    if (!user || user.isSuspended) {
      return ctx.redirect("/?notice=suspended");
    }

    // return ctx.redirect("/?notice=auth-error");
  });
}

export default router;
