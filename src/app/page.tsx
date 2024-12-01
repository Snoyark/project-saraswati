'use client'

import { UnorderedHorizontalList, UnorderedVerticalList } from '@/pages/styles/List';
import { SUPPORTED_TOPICS } from '@/utils/constants';
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <h1>There is no way this updates</h1>
      <UnorderedVerticalList>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About this project</Link>
        </li>
        <li>
          <UnorderedHorizontalList>
            {SUPPORTED_TOPICS.map((item, index) => (
              <li key={index}><Link href={`/${item.url_name}`}>{item.name}</Link></li>
            ))}
          </UnorderedHorizontalList>
        </li>
      </UnorderedVerticalList>
    </div>
  );
};