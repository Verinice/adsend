// Shared TypeScript types for the app
export type Property = {
  id: string;
  name: string;
  pages: Page[];
  banners?: Array<{
    id: string;
    imageUrl: string;
    name: string;
    targetUrl?: string;
    adHtml?: string;
  }>;

};

export type Page = {
  id: string;
  name: string;
  url?: string;
  containers: Container[];
};

export type Container = {
  id: string;
  name: string;
  ads: Ad[];
};

export type Ad = {
  id: string;
  imageUrl: string;
  link: string;
};
