import oauth2, { config } from "./common/oauth";

const scope = "public_repo";

exports.handler = async (event, context) => {
	try {
		const authorizationURI = oauth2.authorizationCode.authorizeURL({
			redirect_uri: config.redirect_uri,
			scope,
			state: "",
		});

		return {
			statusCode: 200,
			body: JSON.stringify({ url: authorizationURI }),
		};
	} catch (err) {
		return { statusCode: 500, body: err.toString() };
	}
};
