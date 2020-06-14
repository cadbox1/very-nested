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
					Create interesting lists on the internet.
				</Styled.h1>
				<Styled.p sx={{ fontSize: 3, mt: 4 }}>
					Very Nested is a free and{" "}
					<Styled.a
						href="https://github.com/cadbox1/very-nested"
						target="_blank"
						rel="noopener noreferrer"
					>
						open source
					</Styled.a>{" "}
					app to create interesting lists and publish them on the internet using
					GitHub.
				</Styled.p>
				<Link
					to="/get-started"
					sx={{
						fontSize: 1,
						py: 3,
						px: 4,
						color: "background",
						backgroundColor: "primary",
						borderRadius: "0.25rem",
						cursor: "pointer",
						border: "none",
						textDecoration: "none",
					}}
				>
					Get Started
				</Link>

				<div>
					<Styled.h2 sx={{ mt: 8 }}>Example - YouTube videos I like</Styled.h2>
					<Styled.p>
						Click on the plus icon to expand an item and see more details about
						it. Each item can be in multiple lists, which means adding a
						description to <em>Matt Corby's Miracle Love</em> in the 'Recent'
						list will add it in the 'Music' and 'All' lists.
					</Styled.p>
					<Styled.p>
						<Styled.a as={Link} to="/examples/youtube">
							Edit this example
						</Styled.a>{" "}
						to see more. You can also check out the{" "}
						<Styled.a
							href="https://cadbox1.github.io/very-nested-youtube/"
							target="_blank"
							rel="noopener noreferrer"
						>
							published page
						</Styled.a>{" "}
						if you like this list.
					</Styled.p>
					<ViewerContainer data={youtubeExample} />
				</div>

				<div>
					<Styled.h2 sx={{ mt: 8 }}>Features</Styled.h2>
					<Styled.h3 sx={{ mt: 6 }}>Nesting</Styled.h3>
					<Styled.p>
						Each item can be in multiple lists, so updating an item in one list
						will update it across all lists. Items can also be expanded and
						collapsed so you can organise your content in fun and creative ways.
					</Styled.p>
					<Styled.h3 sx={{ mt: 6 }}>No Lock-In</Styled.h3>
					<Styled.p>
						Very Nested is free,{" "}
						<Styled.a
							href="https://github.com/cadbox1/very-nested"
							target="_blank"
							rel="noopener noreferrer"
						>
							open source
						</Styled.a>{" "}
						and we don't store any of your data. That means your content is safe
						and under your control, now and into the future. Even if I stopped
						working on Very Nested. You can even host your list on your own
						domain like I've done for{" "}
						<Styled.a
							href="https://cooking.cadell.dev/"
							target="_blank"
							rel="noopener noreferrer"
						>
							cooking.cadell.dev
						</Styled.a>
						.
					</Styled.p>
					<Styled.h3 sx={{ mt: 6 }}>Published on GitHub</Styled.h3>
					<Styled.p>
						We use{" "}
						<Styled.a
							href="https://github.com/"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</Styled.a>{" "}
						to store your lists so you have more control over your data. We also
						use their{" "}
						<Styled.a
							href="https://pages.github.com/"
							target="_blank"
							rel="noopener noreferrer"
						>
							hosting features
						</Styled.a>{" "}
						to create websites for your lists and their{" "}
						<Styled.a
							href="https://en.wikipedia.org/wiki/Version_control"
							target="_blank"
							rel="noopener noreferrer"
						>
							version control
						</Styled.a>{" "}
						features to keep a history of changes to your content. GitHub is{" "}
						<Styled.a
							href="https://github.com/pricing"
							target="_blank"
							rel="noopener noreferrer"
						>
							free
						</Styled.a>{" "}
						and the largest version control provider in the world with over 40
						million users.
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
