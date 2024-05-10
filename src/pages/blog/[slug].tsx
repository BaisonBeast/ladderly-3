import { gSP } from "app/blitz-server"
import fs from "fs"
import matter from "gray-matter"
import { GetStaticPaths, GetStaticProps } from "next"
import path from "path"
import rehypeStringify from "rehype-stringify"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import styles from "src/styles/Home.module.css"
import { unified } from "unified"

import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"
import rehypeExternalLinks from "rehype-external-links"

const tipUrl =
  "https://checkout.stripe.com/c/pay/cs_live_a10YyjvS4xEbZJ9Th74ZTitGd2NZoHBILwU0K8AdL1P5INh5a9ry7h1Bj9#fidkdWxOYHwnPyd1blppbHNgWlIzUk5qNVddT2AyYGM8PURQN01fTUFSYjU1bX9nPX1KZ1InKSd1aWxrbkB9dWp2YGFMYSc%2FJ2BTZDxAMjdgYmBpQ2NWYmNcXycpJ3dgY2B3d2B3SndsYmxrJz8nbXFxdXY%2FKipycnIraWRhYWB3aXwrbGoqJ3gl"

const sBlogCallToAction = `<p class="call-to-action"
  style="font-size: 1rem; font-style: italic; margin: 0 auto;">
  
    Thanks for reading! Ladderly is open source and community driven.
    Consider supporting the maintainers by
    <a href="${tipUrl}" target="_blank">
      leaving a tip!
    </a>
  </p>`

const BlogPost = ({ title, content }: { title: string; content: string }) => {
  return (
    <LadderlyPageWrapper title={title}>
      <main className={styles.main}>
        <h1 className="p-4 text-3xl text-ladderly-violet-600">{title}</h1>
        <article
          className="prose prose-lg max-w-none px-4 text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>
    </LadderlyPageWrapper>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join("src/pages/blog"))
  const paths = files
    .filter((filename) => path.extname(filename) === ".md")
    .map((filename) => ({
      params: {
        slug: filename.replace(".md", ""),
      },
    }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = gSP(async ({ params }) => {
  if (!params || typeof params.slug !== "string") {
    return { notFound: true }
  }

  const slug = params.slug
  const markdownWithMetadata = fs
    .readFileSync(path.join("src/pages/blog", slug + ".md"))
    .toString()

  const { data, content } = matter(markdownWithMetadata)

  const htmlContent = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeExternalLinks, { target: "_blank" })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  const updatedHtml = htmlContent
    .toString()
    .replaceAll("{{ BlogCallToAction }}", sBlogCallToAction)

  return {
    props: {
      title: data.title,
      content: updatedHtml,
    },
  }
})

export default BlogPost
