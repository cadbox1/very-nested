const oauthApi = "https://github.com/login/oauth";
const siteUrl = process.env.REACT_APP_URL || "http://localhost:8888";

export const commonConfig = {
	clientId: process.env.REACT_APP_CLIENT_ID,
	clientSecret: "", // this isn't common, it's defined in auth-callback
	tokenHost: oauthApi,
	authorizePath: `${oauthApi}/authorize`,
	tokenPath: `${oauthApi}/access_token`,
	redirectUri: `${siteUrl}/.netlify/functions/auth-callback`,
};

if (!commonConfig.clientId) {
	throw new Error("MISSING REQUIRED ENV VARS. Please set CLIENT_ID");
}
