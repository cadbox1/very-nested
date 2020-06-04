/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { graphql } from "gatsby";
import Layout from "gatsby-theme-ui-blog/src/layout";
import { Header } from "../components/Header";
import { ViewerContainer } from "../components/ViewerContainer";
import cookingExample from "./examples/cookingExample.json";

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
					Nested lists published on GitHub.
				</Styled.h1>
				<Styled.p sx={{ fontSize: 3, mt: 4 }}>
					Very Nested is a free and open source tool to create nested lists and
					publish them GitHub. Each item can belong to multiple lists and that
					has some cool results.
				</Styled.p>

				<div>
					<Styled.h2 sx={{ mt: 8 }}>Example</Styled.h2>
					<ViewerContainer data={cookingExample} />
				</div>

				<div>
					<Styled.h2 sx={{ mt: 8 }}>Features</Styled.h2>
					<Styled.h3 sx={{ mt: 6 }}>One Item, many Lists</Styled.h3>
					<Styled.p>
						Each item can belong to multiple lists so you can manage your lists
						in creative ways that make sense for your content.
					</Styled.p>
					<Styled.h3 sx={{ mt: 6 }}>Custom Domains</Styled.h3>
					<Styled.p>
						We integrate with GitHub pages to publish your content on your own
						domain name or a github.com address.
					</Styled.p>
					<Styled.h3 sx={{ mt: 6 }}>No Lock-In</Styled.h3>
					<Styled.p>
						Very Nested is free, open source and publicly available. All your
						data on GitHub and under your control.
					</Styled.p>
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
