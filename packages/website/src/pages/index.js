/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { graphql } from "gatsby";
import Layout from "gatsby-theme-ui-blog/src/layout";
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
				<Styled.h1 sx={{ fontSize: 6, mt: 8 }}>
					Nested lists published on GitHub
				</Styled.h1>
				<Styled.p sx={{ fontSize: 3, mt: 4 }}>
					Very Nested is a unique, open source approach to lists with a focus on
					nesting.
				</Styled.p>

				<div>
					<Styled.h2 sx={{ mt: 8 }}>Recipe Example</Styled.h2>
					<Styled.p sx={{ mt: 4 }}>
						Here's my personal Recipe collection. I've organised my Recipes into
						various collections and each Recipe can be a part of multiple
						collections.
					</Styled.p>
					<Styled.a href="/examples/recipes" sx={{ fontSize: 2 }}>
						See the full example.
					</Styled.a>
				</div>
			</div>
		</Layout>
	);
};

export const query = graphql`
	query HomeQuery {
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
