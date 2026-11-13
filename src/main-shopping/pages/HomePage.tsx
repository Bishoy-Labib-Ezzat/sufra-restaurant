import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { EatDrinkTiles } from '../components/home/EatDrinkTiles';
import { FeaturedRail } from '../components/home/FeaturedRail';
import { Hero } from '../components/home/Hero';
import { ServiceStatement } from '../components/home/ServiceStatement';
import { VisitSection } from '../components/home/VisitSection';

export function HomePage() {
  useDocumentTitle('Order online');
  return (
    <>
      <Hero />
      <EatDrinkTiles />
      <FeaturedRail />
      <ServiceStatement />
      <VisitSection />
    </>
  );
}
