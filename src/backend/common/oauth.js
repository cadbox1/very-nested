import simpleOauth from "simple-oauth2";

const oauthApi = "https://github.com/login/oauth";

const siteUrl = process.env.URL || "http://localhost:3000";

export const config = {
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	tokenHost: oauthApi,
	authorizePath: `${oauthApi}/authorize`,
	tokenPath: `${oauthApi}/access_token`,
	redirect_uri: `${siteUrl}/.netlify/functions/auth-callback`,
};

function authInstance(credentials) {
	if (!credentials.client.id) {
		throw new Error("MISSING REQUIRED ENV VARS. Please set CLIENT_ID");
	}
	if (!credentials.client.secret) {
		throw new Error("MISSING REQUIRED ENV VARS. Please set CLIENT_SECRET");
	}
	return simpleOauth.create(credentials);
}

export default authInstance({
	client: {
		id: config.clientId,
		secret: config.clientSecret,
	},
	auth: {
		tokenHost: config.tokenHost,
		tokenPath: config.tokenPath,
		authorizePath: config.authorizePath,
	},
});
