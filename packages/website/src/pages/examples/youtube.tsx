/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { graphql } from "gatsby";
// @ts-ignore
import Layout from "gatsby-theme-ui-blog/src/layout";
// @ts-ignore
import { Header } from "../../components/Header";
import { ViewerContainer } from "../../components/ViewerContainer";
import youtubeExample from "./data/youtube.json";

export default ({ data }: { data: any }) => {
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
				<Styled.h1 sx={{ fontSize: 5 }}>Youtube Example</Styled.h1>
				<Styled.h3>Update a nested item</Styled.h3>
				<Styled.p>
					Expand the 'Recent' and <em>Matt Corby - Miracle Love</em> items,
					click to the right of the YouTube link, hit enter, then add a
					description and see it show up in the 'Music' and 'All' lists.
				</Styled.p>
				<Styled.h3>Nest an existing item in a new list</Styled.h3>
				<Styled.p>
					Click on <em>Babish's Huevos Rancheros</em> inside 'Cooking', copy the
					id next to the edit box. Expand 'Recent', click on{" "}
					<em>Spicy garlic fried chicken</em>, hit enter then paste the id in
					the empty edit box.
				</Styled.p>
				<Styled.p>
					Check out the{" "}
					<Styled.a
						href="https://cadbox1.github.io/very-nested-youtube/"
						target="_blank"
						rel="noopener noreferrer"
					>
						published page
					</Styled.a>{" "}
					if you like this list.
				</Styled.p>
				<ViewerContainer data={youtubeExample} readonly={false} />
			</div>
		</Layout>
	);
};

export const query = graphql`
	query YoutubeExampleQuery {
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
