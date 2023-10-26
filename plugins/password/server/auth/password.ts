import bcrypt from "bcrypt";
import Router from "koa-router";
import { Client } from "@shared/types";
import accountProvisioner from "@server/commands/accountProvisioner";
import ResetPasswordEmail from "@server/emails/templates/ResetPasswordEmail";
import env from "@server/env";
import { rateLimiter } from "@server/middlewares/rateLimiter";
import { User } from "@server/models";
import { RateLimiterStrategy } from "@server/utils/RateLimiter";
import { signIn } from "@server/utils/authentication";
import { assertEmail, assertPresent } from "@server/validation";

const router = new Router();

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
        (auth) => auth.authenticationProvider.name === "password"
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
          name: "password",
          providerId: env.URL,
        },
        authentication: {
          providerId: email,
          accessToken: passwordHash,
          scopes: [],
        },
      });

      await signIn(ctx, "password", {
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
        return ctx.redirect("/?notice=password-request-failed");
      }

      // Insert password request to database

      await new ResetPasswordEmail({
        to: user.email,
        token: user.getEmailSigninToken(),
        userName: user.name,
      }).schedule();

      return ctx.redirect(`/?notice=password-request-success`);
    }
  );
}

export default router;
