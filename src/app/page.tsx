'use client'

import { SUPPORTED_TOPICS } from '@/utils/constants';
import Link from 'next/link'
import { UnorderedHorizontalList, UnorderedVerticalList } from './page_utils/styles/List';

export default function Home() {
  return (
    <div>
      <h1>Version -1.0</h1>
      <UnorderedVerticalList>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About this project</Link>
        </li>
        <li>
          <UnorderedHorizontalList>
            <Link href={`/learn`}>{"Learn about recent papers"}</Link>
          </UnorderedHorizontalList>
        </li>
      </UnorderedVerticalList>
    </div>
  );
};