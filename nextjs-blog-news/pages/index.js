import Head from 'next/head';
import styles from '../styles/About.module.css';
import fetch from 'isomorphic-unfetch';
import { useRouter } from 'next/router';
import { parseString } from 'xml2js';
import { useState } from 'react';

const Article = ({ article }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{article.title}</h1>
      <img src={article.image} alt={article.title} />
      <div dangerouslySetInnerHTML={{ __html: article.description }} />
    </div>
  );
};

const perPage = 4;

export default function Home({ articles }) {
  const [page, setPage] = useState(1);

  const paginate = (pageNumber) => {
    const start = (pageNumber - 1) * perPage;
    const end = start + perPage;
    return articles.slice(start, end);
  };

  const paginatedArticles = paginate(page);

  return (
    <div>
      <Head>
        <title>Next.js Blog Example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to my blog</h1>

        <ul className={styles.articles}>
          {paginatedArticles.map((article, index) => (
            <li key={article.slug} className={index === 0 ? styles.bigArticle : styles.smallArticle}>
              <a href={`/article/${article.slug}`}>
                <h2>{article.title}</h2>
                </a>
                <img src={article.image} alt={article.title} />
                <div dangerouslySetInnerHTML={{ __html: article.description }} />
            </li>
          ))}
        </ul>

        <div className={styles.pagination}>
          {Array.from({ length: Math.ceil(articles.length / perPage) }, (_, i) => i + 1).map((pageNumber) => (
            <button key={pageNumber} className={pageNumber === page ? styles.active : null} onClick={() => setPage(pageNumber)}>
              {pageNumber}
            </button>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Created by Anurag Khard</p>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  const res = await fetch('https://www.essentiallysports.com/feed/');
  const xmlData = await res.text();
  const jsonData = await parseXml(xmlData);

  const articles = jsonData.rss.channel[0].item.map((item) => {
    return {
      title: item.title[0],
      slug: item.link[0].replace(/^.*\/([^/]+)\/?$/, '$1'),
      image: item['media:content'][0]['$']['url'],
      description : item.description[0]
    };
  });

  return { props: { articles }, revalidate: 60 };
}

async function parseXml(xmlData) {
  return new Promise((resolve, reject) => {
    parseString(xmlData, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
