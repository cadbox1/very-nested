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
				<Styled.h1 sx={{ fontSize: 4 }}>Youtube Example</Styled.h1>
				<Styled.p sx={{ fontSize: 1 }}>
					Copy and paste the id to use an existing item in a new list.
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
