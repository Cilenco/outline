
import Router from "koa-router";
import { capitalize } from "lodash";
import bcrypt from "bcryptjs"
import accountProvisioner, {
  AccountProvisionerResult,
} from "@server/commands/accountProvisioner";
import env from "@server/env";
import { User } from "@server/models";
import { StateStore, getTeamFromContext } from "@server/utils/passport";
import { assertEmail, assertPresent } from "@server/validation";
import { signIn } from "@server/utils/authentication";
import { parseDomain } from "@shared/utils/domains";

const router = new Router();
const AUTH_PROVIDER_NAME = "local";

export const config = {
  name: "Local",
  enabled: !!env.LOCAL_LOGIN_ENABLED,
};

if (env.LOCAL_LOGIN_ENABLED) {
  router.post("local", async (ctx) => {
    const { email, password } = ctx.request.body;
    
    assertEmail(email, "email is required");
    assertPresent(password, "password is required");
    
    console.log("Hallo Christian");

    const domain = parseDomain(ctx.request.hostname);        
    const team = await getTeamFromContext(ctx);
    const teamName = capitalize(domain.host);

    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });
  
    // Found a user, validate the password or exit early if does not match
    if (user && !bcrypt.compareSync(password, user.passwordHash ?? "")) {
      ctx.body = { redirect: "/?notice=auth-error" };
      return;
    }
    
    // No user found, check if credentials match env file or exit early
    if (!user && (email != env.LOCAL_LOGIN_EMAIL || password != env.LOCAL_LOGIN_PASSWORD)) {
      ctx.body = { redirect: "/?notice=auth-error" };
      return;
    }
    
    const userEmail = user?.email ?? env.LOCAL_LOGIN_EMAIL;
    const userName = user?.name ?? env.LOCAL_LOGIN_NAME;
    
    const providerId = domain.teamSubdomain + "_" + domain.host + "_" + userEmail;
    
    const result = await accountProvisioner({
      ip: ctx.ip,
      team: {
        teamId: team?.id,
        name: teamName,
        domain: domain.host,
        subdomain: domain.teamSubdomain,
      },
      user: {
        email: userEmail,
        name: userName,
      },
      authenticationProvider: {
        name: AUTH_PROVIDER_NAME,
        providerId: domain.host,
      },
      authentication: {
        providerId: providerId
      },
    });

    // set cookies on response and redirect to team subdomain
    await signIn(ctx, result.user, result.team, "local", result.isNewUser, result.isNewTeam);
  });
}

export default router;
