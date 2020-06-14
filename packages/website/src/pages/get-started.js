/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { graphql } from "gatsby";
import Layout from "gatsby-theme-ui-blog/src/layout";
// @ts-ignore
import { generateAuthorizeUrl } from "very-nested-login";
import { Header } from "../components/Header";

export default ({ data }) => {
	return (
		<Layout title={data.site.siteMetadata.title}>
			<Header title={data.site.siteMetadata.title} />
			<div
				sx={{
					maxWidth: "container",
					mx: "auto",
					mb: 9,
					px: 3,
				}}
			>
				<Styled.h1 sx={{ fontSize: 4 }}>Get Started!</Styled.h1>
				<Styled.h2 sx={{ fontSize: 3, mt: 6 }}>1. GitHub Account</Styled.h2>
				<Styled.p sx={{ fontSize: 2, mt: 4 }}>
					<Styled.a href={generateAuthorizeUrl({})} target="_blank">
						Sign in
					</Styled.a>{" "}
					to GitHub or{" "}
					<Styled.a href={generateAuthorizeUrl({})} target="_blank">
						Signup
					</Styled.a>{" "}
					if you don't already have an account.
				</Styled.p>
				<Styled.h2 sx={{ fontSize: 3, mt: 6 }}>2. Allow access</Styled.h2>
				<Styled.p sx={{ fontSize: 2, mt: 4 }}>
					Allow the Very Nested app to access your GitHub account so we can save
					your lists.
				</Styled.p>
				<Styled.h2 sx={{ fontSize: 3, mt: 6 }}>3. Setup a new repo</Styled.h2>
				<Styled.p sx={{ fontSize: 2, mt: 4 }}>
					Very Nested will setup a new GitHub repository for your list.
				</Styled.p>
				<Styled.h2 sx={{ fontSize: 3, mt: 6 }}>4. Create</Styled.h2>
				<Styled.p sx={{ fontSize: 2, mt: 4 }}>
					Create a list and click save.
				</Styled.p>
				<Styled.h2 sx={{ fontSize: 3, mt: 6 }}>5. Publish</Styled.h2>
				<Styled.p sx={{ fontSize: 2, mt: 4 }}>
					Share your list with a Github.com address. You also have the option to
					setup a custom domain.
				</Styled.p>
			</div>
		</Layout>
	);
};

export const query = graphql`
	query GetStartedQuery {
		site {
			siteMetadata {
				title
				social {
					name
					url
				}
			}
		}
	}
`;
