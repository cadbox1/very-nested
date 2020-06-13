/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { graphql, Link } from "gatsby";
import Layout from "gatsby-theme-ui-blog/src/layout";
import { Header } from "../components/Header";
import { ViewerContainer } from "../components/ViewerContainer";
import youtubeExample from "./examples/data/youtube.json";

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
					Very Nested is a free and{" "}
					<Styled.a
						href="https://github.com/cadbox1/very-nested"
						target="_blank"
					>
						open source
					</Styled.a>{" "}
					tool to create nested lists and publish them GitHub. Each item can
					belong to multiple lists and that has some cool results.
				</Styled.p>

				<div>
					<Styled.h2 sx={{ mt: 8 }}>Example</Styled.h2>
					<Styled.a as={Link} to="/examples/youtube" sx={{ fontSize: 1 }}>
						Edit this example.
					</Styled.a>
					<ViewerContainer data={youtubeExample} />
				</div>

				<div>
					<Styled.h2 sx={{ mt: 8 }}>Features</Styled.h2>
					<Styled.h3 sx={{ mt: 6 }}>One Item, many Lists</Styled.h3>
					<Styled.p>
						Each item can belong to multiple lists so you can organise your
						content in fun and creative ways.
					</Styled.p>
					<Styled.h3 sx={{ mt: 6 }}>No Lock-In</Styled.h3>
					<Styled.p>
						Very Nested is free, open source and publicly available on{" "}
						<Styled.a
							href="https://github.com/cadbox1/very-nested"
							target="_blank"
						>
							GitHub
						</Styled.a>
						. All your data is saved in your own GitHub account, under your
						control.
					</Styled.p>
					<Styled.h3 sx={{ mt: 6 }}>Custom Domains</Styled.h3>
					<Styled.p>
						We integrate with GitHub pages to publish your content on your own
						domain name or a github.com address.
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
