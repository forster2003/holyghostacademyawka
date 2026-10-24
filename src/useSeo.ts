/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

export interface PageSeoConfig {
  title: string;
  description: string;
  slug: string;
  breadcrumbs: { name: string; item: string }[];
}

export const BASE_SITE_URL = 'https://holyghostacademy.edu.ng';

export const PAGE_SEO_MAP: Record<string, PageSeoConfig> = {
  home: {
    title: 'Holy Ghost Academy, Awka – Moral and Academic Excellence | Official Portal',
    description: 'Official portal of Holy Ghost Academy Secondary School, Awka (HGASS). Catholic co-educational institution committed to academic brilliance, moral discipline, and digital student performance tracking.',
    slug: '',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` }
    ]
  },
  results: {
    title: 'Student Results Portal & Performance Tracking | Holy Ghost Academy, Awka',
    description: 'Access student termly continuous assessment report cards, annual cumulative transcripts, and interactive grade trend line charts with Recharts at HGASS Awka.',
    slug: 'results',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Student Portal', item: `${BASE_SITE_URL}/?page=results` }
    ]
  },
  portal: {
    title: 'Student Results Portal & Performance Tracking | Holy Ghost Academy, Awka',
    description: 'Access student termly continuous assessment report cards, annual cumulative transcripts, and interactive grade trend line charts with Recharts at HGASS Awka.',
    slug: 'portal',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Student Portal', item: `${BASE_SITE_URL}/?page=portal` }
    ]
  },
  about: {
    title: 'About Holy Ghost Academy, Awka – History, Vision & Leadership',
    description: 'Discover the heritage, Catholic Diocese of Awka affiliation, founding father Late Rev. Fr. Dr. Emmanuel Obuna, and administrative stewards of HGASS Awka.',
    slug: 'about',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'About Us', item: `${BASE_SITE_URL}/?page=about` }
    ]
  },
  mission: {
    title: 'Mission, Vision & Core Values | Holy Ghost Academy, Awka',
    description: 'Explore the founding mission, spiritual grounding, intellectual rigor, moral uprightness, and core tenets guiding Holy Ghost Academy Secondary School.',
    slug: 'mission',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Mission & Vision', item: `${BASE_SITE_URL}/?page=mission` }
    ]
  },
  subjects: {
    title: 'Academic Curriculum & Subject Catalog | Holy Ghost Academy, Awka',
    description: 'Complete accredited syllabus for Junior Secondary (JSS 1 - JSS 3) and Senior Secondary (SS 1 - SS 3) WAEC, NECO, and BECE examinations at HGASS Awka.',
    slug: 'subjects',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Curriculum & Subjects', item: `${BASE_SITE_URL}/?page=subjects` }
    ]
  },
  payment: {
    title: 'School Fees & Tuition Payment Portal | Holy Ghost Academy, Awka',
    description: 'Official UBA bank transfer details, online fee submission, bursary receipt upload, and automated financial verification for Holy Ghost Academy students.',
    slug: 'payment',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Fees & Payment', item: `${BASE_SITE_URL}/?page=payment` }
    ]
  },
  calendar: {
    title: 'Academic Calendar & School Term Dates | Holy Ghost Academy, Awka',
    description: 'Official academic calendar for Holy Ghost Academy Secondary School Awka covering term resumptions, examination schedules, mid-term breaks, and diocesan events.',
    slug: 'calendar',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Academic Calendar', item: `${BASE_SITE_URL}/?page=calendar` }
    ]
  },
  gallery: {
    title: 'Campus Life & Media Gallery | Holy Ghost Academy, Awka',
    description: 'Visual photo highlights and video archives of science exhibitions, cultural festivals, inter-house sports, and campus activities at HGASS Awka.',
    slug: 'gallery',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Media Gallery', item: `${BASE_SITE_URL}/?page=gallery` }
    ]
  },
  projects: {
    title: 'Campus Infrastructure & Development Projects | Holy Ghost Academy, Awka',
    description: 'Track ongoing structural investments including modern chemistry laboratories, digital ICT suites, sports arenas, and academic learning facilities at HGASS.',
    slug: 'projects',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'School Projects', item: `${BASE_SITE_URL}/?page=projects` }
    ]
  },
  contact: {
    title: 'Contact Administration & Campus Location | Holy Ghost Academy, Awka',
    description: 'Get in touch with Holy Ghost Academy Secondary School, Kamali Homes, Ngozika Housing Estate Phase 2, Awka, Anambra State. Admissions and inquiry helplines.',
    slug: 'contact',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Contact Us', item: `${BASE_SITE_URL}/?page=contact` }
    ]
  },
  admin: {
    title: 'Administration & Management Portal | Holy Ghost Academy, Awka',
    description: 'Secure staff and bursary management portal for student results publishing, attendance tracking, fee reconciliation, and SEO tools at HGASS Awka.',
    slug: 'admin',
    breadcrumbs: [
      { name: 'Home', item: `${BASE_SITE_URL}/` },
      { name: 'Admin Dashboard', item: `${BASE_SITE_URL}/?page=admin` }
    ]
  }
};

/**
 * Custom hook to synchronize Page Title, Meta Description, Canonical URL,
 * OpenGraph tags, BreadcrumbList Schema, and URL Query Slugs (Item 4, 5, 6, 10, 16, 17)
 */
export function useSeo(currentPage: string, setCurrentPage: (page: string) => void) {
  // 1. Synchronize URL on popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam && PAGE_SEO_MAP[pageParam]) {
        setCurrentPage(pageParam);
      } else {
        // Check hash
        const hash = window.location.hash.replace('#', '');
        if (hash && PAGE_SEO_MAP[hash]) {
          setCurrentPage(hash);
        } else {
          setCurrentPage('home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPage]);

  // 2. Synchronize URL search params and dynamic SEO tags when currentPage changes
  useEffect(() => {
    const seo = PAGE_SEO_MAP[currentPage] || PAGE_SEO_MAP.home;

    // Update document title
    document.title = seo.title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seo.description);

    // Update Canonical URL
    const canonicalHref = seo.slug ? `${BASE_SITE_URL}/?page=${seo.slug}` : `${BASE_SITE_URL}/`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalHref);

    // Update OpenGraph Title & Description
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalHref);

    // Update Twitter Title & Description
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', seo.title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', seo.description);

    // Synchronize browser URL slug without reloading
    const currentParams = new URLSearchParams(window.location.search);
    const currentPageInUrl = currentParams.get('page') || 'home';
    const targetSlug = seo.slug || 'home';

    if (currentPageInUrl !== targetSlug) {
      const newQuery = seo.slug ? `?page=${seo.slug}` : window.location.pathname;
      window.history.pushState({ page: currentPage }, seo.title, newQuery);
    }

    // Dynamic BreadcrumbList Schema injection for rich search snippets
    let breadcrumbScript = document.getElementById('schema-breadcrumbs');
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.setAttribute('type', 'application/ld+json');
      breadcrumbScript.setAttribute('id', 'schema-breadcrumbs');
      document.head.appendChild(breadcrumbScript);
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: seo.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.item
      }))
    };

    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
  }, [currentPage]);
}
