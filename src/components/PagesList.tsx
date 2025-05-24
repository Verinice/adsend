import { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import type { Page } from "../types";

// Update PagesListProps to match modal-based editing
interface PagesListProps {
  pages: Page[];
  onAddPage: (pageName: string, containersRaw: string, url: string) => void;
  onEditPage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  variant?: string; // Optional variant for styling (e.g., 'card-list')
  showContainers?: boolean; // Optional: show containers as badges under each page
}

// PagesList: List pages in a modern card/list style with edit and delete actions
export default function PagesList({ pages = [], onAddPage, onEditPage, onDeletePage, variant }: PagesListProps) {
  if (!Array.isArray(pages) || pages.length === 0) {
    return (
      <div className="text-gray-400 dark:text-gray-500 italic text-sm px-2 py-2">No pages added yet.</div>
    );
  }
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 mb-2">
      {pages.map((page) => (
        <li key={page.id} className="flex flex-col gap-1 px-4 py-3 group hover:bg-green-50 dark:hover:bg-gray-800 transition">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full">
              <svg className="w-5 h-5 text-green-700 dark:text-green-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" /></svg>
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">{page.name}</div>
              {page.url && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{page.url}</div>
              )}
              {Array.isArray(page.containers) && page.containers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {page.containers.map((container: any) => (
                    <span key={container.id} className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-0.5 rounded-full font-medium">
                      {container.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none"
                title="Edit Page"
                onClick={() => onEditPage(page.id)}
                type="button"
              >
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h2v2h2v-2h2v-2h-2v-2H9v2z" /></svg>
              </button>
              <button
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none"
                title="Delete Page"
                onClick={() => onDeletePage(page.id)}
                type="button"
              >
                <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {page.url && (
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open page in new tab"
                  className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none"
                >
                  {/* Eye icon, same size as edit/delete icons */}
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
