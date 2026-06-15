import { useState } from 'react';
import { useWindowDimensions } from 'react-native';

import type { NoticeFeedItem } from '../types/models';
import {
  NewsBadge,
  NewsCard,
  NewsDate,
  NewsDescription,
  NewsDot,
  NewsDots,
  NewsScroll,
  NewsTitle,
} from './NoticeCarousel.styles';

type NoticeCarouselProps = {
  items: NoticeFeedItem[];
};

function formatNoticeDate(value: string) {
  if (!value) {
    return 'Aviso';
  }

  return `Publicado em ${value.slice(0, 10).split('-').reverse().join('/')}`;
}

export function NoticeCarousel({ items }: NoticeCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = Math.max(width - 32, 280);

  if (!items.length) {
    return null;
  }

  return (
    <>
      <NewsScroll
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
          setActiveIndex(index);
        }}
      >
        {items.map((item) => (
          <NewsCard key={item.id} style={{ width: cardWidth }}>
            <NewsBadge>{item.chip}</NewsBadge>
            <NewsTitle>{item.texto}</NewsTitle>
            <NewsDescription>Comunicado academico</NewsDescription>
            <NewsDate>{formatNoticeDate(item.created_at)}</NewsDate>
          </NewsCard>
        ))}
      </NewsScroll>

      <NewsDots>
        {items.map((item, index) => (
          <NewsDot key={item.id} $active={index === activeIndex} />
        ))}
      </NewsDots>
    </>
  );
}
