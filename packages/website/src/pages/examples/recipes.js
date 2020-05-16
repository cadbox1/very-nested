/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { graphql } from "gatsby";
import Layout from "gatsby-theme-ui-blog/src/layout";
import { Header } from "../../components/Header";
import { ViewerContainer } from "../../components/ViewerContainer";
import cookingExample from "./cookingExample.json";

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
				<Styled.h1 sx={{ fontSize: 4 }}>Recipes Example</Styled.h1>
				<Styled.p sx={{ fontSize: 2, mt: 4 }}>
					Here's my personal Recipe collection. I've organised my Recipes into
					various collections and each Recipe can be a part of multiple
					collections. Editing the recipe in any list will update it across all
					lists.
				</Styled.p>
				<Styled.p sx={{ fontSize: 2, mt: 4 }}>
					I've also published this on my own domain using GitHub pages at{" "}
					<Styled.a href="https://cooking.cadell.dev">
						cooking.cadell.dev
					</Styled.a>
					.
				</Styled.p>

				<ViewerContainer data={cookingExample} />
			</div>
		</Layout>
	);
};

export const query = graphql`
	query RecipesQuery {
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
