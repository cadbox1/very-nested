import React, { useEffect } from "react";
import queryString from "query-string";

const clientId = "c7381fe587f3cdaf4e30";
const siteUrl = "https://verynestedapp.cadell.dev";

const oauthApi = "https://github.com/login/oauth";

export const oauthConfg = {
	clientId,
	clientSecret: "",
	tokenHost: oauthApi,
	authorizePath: `${oauthApi}/authorize`,
	tokenPath: `${oauthApi}/access_token`,
	redirectUri: `${siteUrl}/.netlify/functions/auth-callback`,
};

export interface GenerateAuthorizeUrlArguments {
	scope?: string;
}

export const generateAuthorizeUrl = ({
	scope = "public_repo",
}: GenerateAuthorizeUrlArguments) => {
	const params = {
		response_type: "code",
		client_id: oauthConfg.clientId,
		redirect_uri: oauthConfg.redirectUri,
		scope,
		state: "",
	};

	return oauthConfg.authorizePath + "?" + queryString.stringify(params);
};
