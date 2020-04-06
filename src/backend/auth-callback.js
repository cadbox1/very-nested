import simpleOauth from "simple-oauth2";
import { commonConfig } from "../common/oauth-config";

export const backendSimpleConfig = {
	client: {
		id: commonConfig.clientId,
		secret: process.env.CLIENT_SECRET,
	},
	auth: {
		tokenHost: commonConfig.tokenHost,
		tokenPath: commonConfig.tokenPath,
		authorizePath: commonConfig.authorizePath,
	},
};

if (!backendSimpleConfig.client.secret) {
	throw new Error("MISSING REQUIRED ENV VARS. Please set CLIENT_SECRET");
}

const oauth2 = simpleOauth.create(backendSimpleConfig);

/* Function to handle intercom auth callback */
exports.handler = (event, context, callback) => {
	const code = event.queryStringParameters.code;
	/* state helps mitigate CSRF attacks & Restore the previous state of your app */
	const state = event.queryStringParameters.state;

	/* Take the grant code and exchange for an accessToken */
	oauth2.authorizationCode
		.getToken({
			code,
			redirect_uri: commonConfig.redirectUri,
			client_id: backendSimpleConfig.client.id,
			client_secret: backendSimpleConfig.client.secret,
		})
		.then((result) => {
			const accessToken = oauth2.accessToken.create(result);
			return callback(null, {
				statusCode: 200,
				body: `<html>
						<body>
							<script>
								alert("hello");
								window.opener.handleToken("${accessToken.token.access_token}");
								window.close();
							</script>
						</body>
					</html>`,
			});
		})
		.catch((error) => {
			console.log("Access Token Error", error.message);
			console.log(error);
			return callback(null, {
				statusCode: error.statusCode || 500,
				body: JSON.stringify({
					error: error.message,
				}),
			});
		});
};
