import oauth2, { config } from "./common/oauth";

/* Function to handle intercom auth callback */
exports.handler = (event, context, callback) => {
	const code = event.queryStringParameters.code;
	/* state helps mitigate CSRF attacks & Restore the previous state of your app */
	const state = event.queryStringParameters.state;

	/* Take the grant code and exchange for an accessToken */
	oauth2.authorizationCode
		.getToken({
			code: code,
			redirect_uri: config.redirect_uri,
			client_id: config.clientId,
			client_secret: config.clientSecret,
		})
		.then((result) => {
			const accessToken = oauth2.accessToken.create(result);
			return callback(null, {
				statusCode: 200,
				body: `<html>
						<body>
							<script>
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
