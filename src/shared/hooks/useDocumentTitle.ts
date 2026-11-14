import { useEffect } from 'react';
import { t } from '@/shared/i18n';

// The tab title has two owners: the current page sets its name, and the dashboard sets a badge
// (the number of new orders). Keeping both here means neither overwrites the other.
let pageTitle = document.title;
let badge = 0;

function render() {
  document.title = badge ? `(${badge}) ${pageTitle}` : pageTitle;
}

export function setTitleBadge(count: number) {
  badge = count;
  render();
}

export function useDocumentTitle(title: string, suffix = t.meta.titleSuffix) {
  useEffect(() => {
    pageTitle = title ? `${title} | ${suffix}` : suffix;
    render();
  }, [title, suffix]);
}
