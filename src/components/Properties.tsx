"use client";
import { useState, useEffect, useRef } from "react";
import type { Property } from "../types";
import PagesList from "./PagesList";
import BannerUpload from "./BannerUpload";

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [newProp, setNewProp] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editContainers, setEditContainers] = useState(""); // New state for target containers

  // Add modal state
  const [showAddPageModal, setShowAddPageModal] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState("");
  const [newPageUrl, setNewPageUrl] = useState("");
  const [newPageContainers, setNewPageContainers] = useState("");

  // Add modal state for editing a page
  const [editPageModal, setEditPageModal] = useState<{ propertyId: string, page: any } | null>(null);
  const [editPageName, setEditPageName] = useState("");
  const [editPageUrl, setEditPageUrl] = useState("");
  const [editPageContainers, setEditPageContainers] = useState("");

  // Add confirmation dialog for property deletion, animated modals, and a property details modal
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // New states for drag-and-drop
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  // Loading state for skeleton
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(properties.length / pageSize);
  const paginatedProperties = properties.slice((page - 1) * pageSize, page * pageSize);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Add confirmation dialogs for page and banner deletion
  const [confirmDeletePage, setConfirmDeletePage] = useState<{ propertyId: string, pageId: string, name: string } | null>(null);
  const [confirmDeleteBanner, setConfirmDeleteBanner] = useState<{ propertyId: string, bannerId: string, name: string } | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });
  // Loading state for modals
  const [savingPage, setSavingPage] = useState(false);

  // Fetch properties and property-level banners from API on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/properties')
      .then(res => res.json())
      .then(async data => {
        if (!Array.isArray(data.properties)) return;
        // For each property, fetch its banners and unique pages/containers
        const propertiesWithBannersAndPages = await Promise.all(
          data.properties.map(async (property: any) => {
            // Fetch banners
            const res = await fetch(`/api/properties/${property.id}/banners/dashboard`);
            const bannerData = await res.json();
            const banners = Array.isArray(bannerData.banners)
              ? bannerData.banners.map((b: any) => ({
                  ...b,
                  adHtml: getBannerAdHtml(b)
                }))
              : [];
            // Fetch unique pages for this property
            const pagesRes = await fetch(`/api/properties/${property.id}/pages`);
            const pagesData = await pagesRes.json();
            const pages = Array.isArray(pagesData.pages)
              ? await Promise.all(pagesData.pages.map(async (page: any) => {
                  // Fetch unique containers for this page
                  const containersRes = await fetch(`/api/pages/${page.id}/containers`);
                  const containersData = await containersRes.json();
                  // Deduplicate containers by name (should already be unique from API, but double check)
                  const uniqueContainers = Array.from(new Map((containersData.containers || []).map((c: any) => [c.name, c])).values());
                  return { ...page, containers: uniqueContainers };
                }))
              : [];
            return {
              ...property,
              banners,
              pages,
            };
          })
        );
        setProperties(propertiesWithBannersAndPages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Helper to always generate adHtml using imageUrl
  function getBannerAdHtml(banner: any) {
    let imgUrl = banner.imageUrl || '';
    // Ensure imgUrl starts with /uploads/
    if (imgUrl && !imgUrl.startsWith('/uploads/')) {
      imgUrl = '/uploads/' + imgUrl.replace(/^.*[\\/]/, '');
    }
    // Use style to ensure image fits parent, no overflow or cut off
    return `<a href="#" target="_blank" rel="noopener noreferrer"><img src="${imgUrl}" alt="${banner.name || ''}" style="display:block;max-width:100%;max-height:100%;width:100%;height:auto;object-fit:contain;box-sizing:border-box;" /></a>`;
  }

  // Add property (now with API call)
  const handleAdd = async () => {
    if (!newProp.trim()) return;
    const propertyId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // Call API
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: propertyId, name: newProp.trim() })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setProperties([
        ...properties,
        { id: propertyId, name: newProp.trim(), pages: [] },
      ]);
      setNewProp("");
      setSnackbar({ open: true, message: 'Property added successfully!', type: 'success' });
    } else {
      setSnackbar({ open: true, message: data.error || 'Failed to add property.', type: 'error' });
    }
  };

  // Replace handleDelete with confirmation dialog trigger
  const handleDeleteProperty = (id: string) => {
    const prop = properties.find((p) => p.id === id);
    if (prop) setConfirmDelete({ id, name: prop.name });
  };

  const confirmDeleteProperty = async () => {
    if (!confirmDelete) return;
    // Call DELETE API for property
    await fetch(`/api/properties/${confirmDelete.id}`, {
      method: 'DELETE',
    });
    setProperties(properties.filter((p) => p.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  const handleSave = (id: string) => {
    setProperties(properties.map((p) =>
      p.id === id ? { ...p, name: editValue.trim() } : p
    ));
    setEditingId(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Update handleAddPage to accept url
  const handleAddPage = async (propertyId: string, pageName: string, containersRaw: string, url: string) => {
    setSavingPage(true);
    try {
      const pageId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      // Call API to create the page
      await fetch(`/api/properties/${propertyId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, name: pageName, url })
      });
      // Persist containers in backend
      // Remove duplicate containers/selectors
      const containers = containersRaw
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
      const uniqueContainers = Array.from(new Set(containers));
      for (const c of uniqueContainers) {
        const containerId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        await fetch(`/api/pages/${pageId}/containers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ containerId, name: c })
        });
      }
      // Update local state
      setProperties(properties.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              pages: Array.isArray(p.pages)
                ? [...p.pages, {
                    id: pageId,
                    name: pageName,
                    url,
                    containers: containers.map((c, idx) => ({ id: `${Date.now()}-${idx}`, name: c, ads: [] }))
                  }]
                : [{ id: pageId, name: pageName, url, containers: containers.map((c, idx) => ({ id: `${Date.now()}-${idx}`, name: c, ads: [] })) }]
            }
          : p
      ));
      setSnackbar({ open: true, message: 'Page added successfully!', type: 'success' });
      setShowAddPageModal(null);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to add page.', type: 'error' });
    } finally {
      setSavingPage(false);
    }
  };

  // Add this function after handleAddPage
  const handleUpdatePage = async (propertyId: string, pageId: string, name: string, url: string, containersRaw: string) => {
    setSavingPage(true);
    try {
      // Update page name and url in backend
      await fetch(`/api/properties/${propertyId}/pages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, name, url })
      });
      // Update containers in backend (delete all, then re-add)
      // (Optional: optimize to diff, but for now, brute force)
      // 1. Delete all containers for this page
      await fetch(`/api/pages/${pageId}/containers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      // 2. Add new containers
      // Remove duplicate containers/selectors
      const containers = containersRaw
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);
      const uniqueContainers = Array.from(new Set(containers));
      for (const c of uniqueContainers) {
        await fetch(`/api/pages/${pageId}/containers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ containerId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: c })
        });
      }
      // Update local state
      setProperties(properties => properties.map(prop =>
        prop.id === propertyId
          ? {
            ...prop,
            pages: prop.pages.map(pg =>
              pg.id === pageId
                ? {
                  ...pg,
                  name: name.trim(),
                  url: url.trim(),
                  containers: containers.map((c, idx) => ({ id: `${Date.now()}-${idx}`, name: c, ads: [] }))
                }
                : pg
            )
          }
          : prop
      ));
      setSnackbar({ open: true, message: 'Page updated successfully!', type: 'success' });
      setEditPageModal(null);
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update page.', type: 'error' });
    } finally {
      setSavingPage(false);
    }
  };

  const handleEditPage = (propertyId: string, pageId: string, newName: string) => {
    setProperties(properties.map((p) =>
      p.id === propertyId
        ? {
            ...p,
            pages: p.pages.map(pg => pg.id === pageId ? { ...pg, name: newName } : pg),
          }
        : p
    ));
  };

  // Delete page (now with API call)
  const handleDeletePage = async (propertyId: string, pageId: string) => {
    // Call API
    await fetch(`/api/properties/${propertyId}/pages`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId })
    });
    setProperties(properties.map((p) =>
      p.id === propertyId
        ? { ...p, pages: Array.isArray(p.pages) ? p.pages.filter(pg => pg.id !== pageId) : [] }
        : p
    ));
  };

  // Add banner (now with API call and file upload, mapped to property only)
  const handleAddBanner = async (propertyId: string, file: File) => {
    const property = properties.find(p => p.id === propertyId);
    const newBannerId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 1. Upload the file to /api/upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('propertyId', propertyId);
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadRes.json();
    if (!uploadData.url) {
      alert('Banner upload failed');
      return;
    }
    const imageUrl = uploadData.url;

    // 2. Call API to create banner record in DB (property-level, not container-level)
    await fetch(`/api/properties/${propertyId}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bannerId: newBannerId,
        propertyId,
        ad_html: `<a href=\"#\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"${imageUrl}\" alt=\"${file.name}\" style=\"max-width:100%;height:auto;display:block;\" /></a>`,
        imageUrl,
        name: file.name,
      })
    });

    setProperties(properties.map((p) => {
      if (p.id === propertyId) {
        return {
          ...p,
          banners: [
            ...(p.banners || []),
            {
              id: newBannerId,
              imageUrl,
              name: file.name,
              targetUrl: '',
              adHtml: `<a href=\"#\" target=\"_blank\" rel=\"noopener noreferrer\"><img src=\"${imageUrl}\" alt=\"${file.name}\" style=\"max-width:100%;height:auto;display:block;\" /></a>`
            }
          ]
        };
      }
      return p;
    }));
  };

  // Remove banner from backend and UI (property-level)
  const handleRemoveBanner = async (propertyId: string, bannerId: string) => {
    await fetch(`/api/properties/${propertyId}/banners`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannerId })
    });
    setProperties(properties => properties.map(p =>
      p.id !== propertyId ? p : {
        ...p,
        banners: Array.isArray(p.banners) ? p.banners.filter((b: any) => b.id !== bannerId) : []
      }
    ));
  };

  // Update banner in backend and UI (property-level)
  const handleUpdateBanner = async (propertyId: string, bannerId: string, data: Partial<{ targetUrl: string; adHtml: string }>) => {
    await fetch(`/api/properties/${propertyId}/banners`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannerId, targetUrl: data.targetUrl, adHtml: data.adHtml })
    });
    setProperties(properties => properties.map(p =>
      p.id !== propertyId ? p : {
        ...p,
        banners: Array.isArray(p.banners)
          ? p.banners.map((b: any) => b.id === bannerId ? { ...b, ...data } : b)
          : []
      }
    ));
  };

  // --- Container CRUD logic ---
  const handleAddContainer = async (propertyId: string, pageId: string, name: string) => {
    const containerId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await fetch(`/api/pages/${pageId}/containers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ containerId, name })
    });
    setProperties(properties => properties.map(p =>
      p.id !== propertyId ? p : {
        ...p,
        pages: (p.pages || []).map(page =>
          page.id !== pageId ? page : {
            ...page,
            containers: [...(page.containers || []), { id: containerId, name, banners: [] }]
          }
        )
      }
    ));
  };

  const handleEditContainer = async (propertyId: string, pageId: string, containerId: string, name: string) => {
    await fetch(`/api/pages/${pageId}/containers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ containerId, name })
    });
    setProperties(properties => properties.map(p =>
      p.id !== propertyId ? p : {
        ...p,
        pages: (p.pages || []).map(page =>
          page.id !== pageId ? page : {
            ...page,
            containers: (page.containers || []).map(container =>
              container.id !== containerId ? container : { ...container, name }
            )
          }
        )
      }
    ));
  };

  // Drag and drop handlers (visual only)
  function handleDragStart(id: string) {
    setDraggedId(id);
  }
  function handleDragOver(id: string) {
    dragOverId.current = id;
  }
  function handleDrop() {
    if (!draggedId || !dragOverId.current || draggedId === dragOverId.current) return;
    const fromIdx = properties.findIndex(p => p.id === draggedId);
    const toIdx = properties.findIndex(p => p.id === dragOverId.current);
    if (fromIdx === -1 || toIdx === -1) return;
    const updated = [...properties];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setProperties(updated);
    setDraggedId(null);
    dragOverId.current = null;
  }
  function handleDragEnd() {
    setDraggedId(null);
    dragOverId.current = null;
  }

  // Place this at the top level of the Properties component, NOT inside JSX:
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 3500);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Remove outer container background, margin, padding, border, and shadow
  return (
    <div>
      <h2 className="text-xl font-semibold mt-4 mb-6 text-green-700 dark:text-green-200 flex items-center gap-2 tracking-tight">
        <svg className="w-7 h-7 text-green-500 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-10 0v6a2 2 0 002 2h6a2 2 0 002-2v-6m-10 0h10" /></svg>
        Manage Properties
      </h2>
      <form
        className="relative flex items-center mb-8 bg-white dark:bg-gray-900 border border-green-200 dark:border-gray-700 rounded-2xl px-6 py-4 animate-pop-in"
        onSubmit={e => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <input
          className="border-none outline-none bg-transparent focus:ring-0 w-full text-lg text-green-900 dark:text-green-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold pr-32"
          placeholder="Add new property (website)"
          value={newProp}
          onChange={e => setNewProp(e.target.value)}
          style={{ boxShadow: 'none' }}
        />
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold text-base shadow-none focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          type="submit"
          style={{ minWidth: '90px' }}
        >
          <span className="flex items-center justify-center w-5 h-5 mr-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </span>
          Add
        </button>
      </form>
      <ul className="space-y-6 flex-1">
        {loading ? (
          Array.from({ length: 2 }).map((_, idx) => (
            <li key={idx} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm pb-4 px-0 pt-0 animate-pulse">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-t-2xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="inline-flex items-center justify-center w-9 h-9 bg-green-100 dark:bg-gray-800 rounded-full" />
                  <span className="h-6 w-32 bg-green-200 dark:bg-gray-700 rounded animate-pulse" />
                  <span className="ml-2 h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <span className="ml-2 h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                  <span className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="px-6 pt-4 pb-2">
                <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                <div className="h-8 w-full bg-gray-100 dark:bg-gray-900 rounded mb-2 animate-pulse" />
              </div>
            </li>
          ))
        ) : (
          paginatedProperties.map((p, idx) => (
            <li
              key={p.id}
              className={`rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm transition-shadow pb-4 px-0 pt-0 group relative animate-fade-in ${draggedId === p.id ? 'ring-4 ring-green-300 dark:ring-green-700' : ''}`}
              draggable
              onDragStart={() => handleDragStart(p.id)}
              onDragOver={e => { e.preventDefault(); handleDragOver(p.id); }}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              style={{ opacity: draggedId === p.id ? 0.7 : 1, cursor: 'grab' }}
            >
              {/* Card header with expand/collapse, inline edit, and quick actions */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 dark:bg-gray-800 rounded-t-2xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="inline-flex items-center justify-center w-9 h-9 bg-green-100 dark:bg-gray-800 rounded-full animate-pop-in">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-10 0v6a2 2 0 002 2h6a2 2 0 002-2v-6m-10 0h10" /></svg>
                  </span>
                  {editingId === p.id ? (
                    <input
                      className="text-lg font-bold text-green-800 dark:text-green-200 bg-transparent border-b-2 border-green-400 focus:outline-none px-1 w-40"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSave(p.id)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSave(p.id); if (e.key === 'Escape') handleCancel(); }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="font-bold text-lg text-green-800 dark:text-green-200 truncate cursor-pointer hover:underline"
                      title={p.name}
                      onClick={() => handleEdit(p.id, p.name)}
                    >
                      {p.name}
                    </span>
                  )}
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{p.pages?.length || 0} pages</span>
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{p.banners?.length || 0} banners</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-green-300"
                    title={expandedId === p.id ? 'Collapse' : 'Expand'}
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  >
                    <svg className={`w-6 h-6 transition-transform ${expandedId === p.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="relative">
                    <button
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-full focus:outline-none"
                      title="More actions"
                      onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
                    </button>
                    {menuOpenId === p.id && (
                      <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-gray-800 rounded-t-lg" onClick={() => {
                          if (expandedId !== p.id) setExpandedId(p.id);
                          setTimeout(() => setShowDetails(p.id), expandedId === p.id ? 0 : 200); // allow expand animation to start
                          setMenuOpenId(null);
                        }}>
                          Details
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-800" onClick={() => { handleEdit(p.id, p.name); setMenuOpenId(null); }}>Rename</button>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded-b-lg" onClick={() => { handleDeleteProperty(p.id); setMenuOpenId(null); }}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Card body: expand/collapse */}
              <div className={`transition-all duration-300 overflow-hidden ${expandedId === p.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}> 
                <div className="px-6 pt-4 pb-2">
                  {/* Property Details Modal (unchanged) */}
                  {showDetails === p.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 w-full max-w-md relative animate-pop-in">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => setShowDetails(null)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="text-lg font-bold mb-4 text-green-700">Property Details</h3>
                        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200"><span className="font-semibold">Name:</span> {p.name}</div>
                        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                          <span className="font-semibold">ID:</span>
                          <span className="select-all break-all" title={p.id}>{p.id}</span>
                          <button
                            className="ml-1 p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 transition"
                            title="Copy ID"
                            onClick={() => {
                              navigator.clipboard.writeText(p.id);
                              setCopiedScriptId('property-id-' + p.id);
                              setTimeout(() => setCopiedScriptId(null), 1200);
                            }}
                            type="button"
                          >
                            {copiedScriptId === 'property-id-' + p.id ? (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                            )}
                          </button>
                        </div>
                        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200"><span className="font-semibold">Pages:</span> {p.pages?.length || 0}</div>
                        <div className="mb-2 text-sm text-gray-700 dark:text-gray-200"><span className="font-semibold">Banners:</span> {p.banners?.length || 0}</div>
                        {/* Per-page injector script UI with dropdown */}
                        {Array.isArray(p.pages) && p.pages.length > 0 && (
                          <div className="mb-4 mt-4">
                            <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">Injector Script (per page)</label>
                            <PageScriptSelector
                              propertyId={p.id}
                              pages={p.pages}
                              copiedScriptId={copiedScriptId}
                              setCopiedScriptId={setCopiedScriptId}
                            />
                          </div>
                        )}
                        <div className="flex justify-end mt-4">
                          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition" onClick={() => setShowDetails(null)}>Close</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Pages under property */}
                  <div className="flex items-center justify-between mb-2 mt-2">
                    <span className="text-base font-semibold text-gray-700 dark:text-gray-200">Pages</span>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-green-400 bg-transparent text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-gray-800 flex items-center gap-1 border border-green-200 dark:border-green-700 shadow-sm"
                        type="button"
                        onClick={() => setShowAddPageModal(p.id)}
                        title="Add Page"
                      >
                        <svg className="w-5 h-5 mr-1 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add
                      </button>
                      <label className="flex items-center px-3 py-1 rounded text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-green-400 bg-transparent text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-gray-800 cursor-pointer gap-1 border border-green-200 dark:border-green-700 shadow-sm"
                        title="Add Banner"
                      >
                        <svg className="w-5 h-5 mr-1 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4M4 4l8 8m0 0l8-8" /></svg>
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleAddBanner(p.id, e.target.files[0]);
                            e.target.value = '';
                          }
                        }} />
                        Banner
                      </label>
                    </div>
                  </div>
                  <PagesList
                    pages={p.pages}
                    onAddPage={(pageName: string, containersRaw: string, url: string) => handleAddPage(p.id, pageName, containersRaw, url)}
                    onEditPage={(pageId: string) => {
                      const page = p.pages.find(pg => pg.id === pageId);
                      if (page) {
                        setEditPageModal({ propertyId: p.id, page });
                        setEditPageName(page.name);
                        setEditPageUrl(page.url || "");
                        setEditPageContainers((page.containers || []).map((c: any) => c.name).join(", "));
                      }
                    }}
                    onDeletePage={(pageId: string) => {
                      const page = p.pages.find(pg => pg.id === pageId);
                      if (page) setConfirmDeletePage({ propertyId: p.id, pageId, name: page.name });
                    }}
                    variant="card-list"
                    showContainers
                  />
                  {/* Add Page Modal */}
                  {showAddPageModal === p.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-sm relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => setShowAddPageModal(null)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="text-lg font-bold mb-4 text-green-700 dark:text-green-200">Add New Page</h3>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Page Name</label>
                          <input
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-200 text-sm dark:bg-gray-900 dark:text-gray-100"
                            placeholder="Page name"
                            value={newPageName}
                            onChange={e => setNewPageName(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Page URL</label>
                          <input
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm dark:bg-gray-900 dark:text-gray-100"
                            placeholder="https://example.com/page"
                            value={newPageUrl}
                            onChange={e => setNewPageUrl(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Target Containers (ID or .class, comma separated)</label>
                          <input
                            className="border border-blue-300 dark:border-gray-700 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm dark:bg-gray-900 dark:text-gray-100"
                            placeholder="#main, .ad-slot"
                            value={newPageContainers}
                            onChange={e => setNewPageContainers(e.target.value)}
                          />
                        </div>
                        <button
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-none transition flex items-center justify-center gap-2 dark:bg-green-700 dark:hover:bg-green-600 dark:focus:ring-green-500"
                          onClick={async () => {
                            if (newPageName.trim()) {
                              setSavingPage(true);
                              try {
                                await handleAddPage(p.id, newPageName.trim(), newPageContainers, newPageUrl.trim());
                                setSnackbar({ open: true, message: 'Page added successfully!', type: 'success' });
                                setShowAddPageModal(null);
                                setNewPageName("");
                                setNewPageUrl("");
                                setNewPageContainers("");
                              } catch {
                                setSnackbar({ open: true, message: 'Failed to add page.', type: 'error' });
                              } finally {
                                setSavingPage(false);
                              }
                            }
                          }}
                          type="button"
                          disabled={savingPage}
                        >
                          {savingPage && <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Edit Page Modal */}
                  {editPageModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={() => setEditPageModal(null)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h3 className="text-lg font-bold mb-4 text-green-700">Edit Page</h3>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Page Name</label>
                          <input
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-200 text-sm dark:bg-gray-900 dark:text-gray-100"
                            placeholder="Page name"
                            value={editPageName}
                            onChange={e => setEditPageName(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Page URL</label>
                          <input
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm dark:bg-gray-900 dark:text-gray-100"
                            placeholder="https://example.com/page"
                            value={editPageUrl}
                            onChange={e => setEditPageUrl(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Target Containers (ID or .class, comma separated)</label>
                          <input
                            className="border border-blue-300 dark:border-gray-700 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm dark:bg-gray-900 dark:text-gray-100"
                            placeholder="#main, .ad-slot"
                            value={editPageContainers}
                            onChange={e => setEditPageContainers(e.target.value)}
                          />
                        </div>
                        <button
                          className="w-full bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition flex items-center justify-center gap-2"
                          onClick={async () => {
                            if (editPageName.trim()) {
                              setSavingPage(true);
                              try {
                                await handleUpdatePage(
                                  editPageModal.propertyId,
                                  editPageModal.page.id,
                                  editPageName,
                                  editPageUrl,
                                  editPageContainers
                                );
                                setSnackbar({ open: true, message: 'Page updated successfully!', type: 'success' });
                                setEditPageModal(null);
                              } catch {
                                setSnackbar({ open: true, message: 'Failed to update page.', type: 'error' });
                              } finally {
                                setSavingPage(false);
                              }
                            }
                          }}
                          type="button"
                          disabled={savingPage}
                        >
                          {savingPage && <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Banner upload and list */}
                  <BannerUpload
                    banners={p.banners || []}
                    onUpload={(file: File) => handleAddBanner(p.id, file)}
                    onRemove={(bannerId: string) => {
                      const banner = (p.banners || []).find((b: any) => b.id === bannerId);
                      if (banner) setConfirmDeleteBanner({ propertyId: p.id, bannerId, name: banner.name });
                    }}
                    onUpdate={(bannerId: string, data: Partial<{ targetUrl: string; adHtml: string }>) => handleUpdateBanner(p.id, bannerId, data)}
                    iconStyle="centered"
                  />
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
      {/* Confirmation dialog for property deletion */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-xs relative animate-pop-in">
            <h3 className="text-lg font-bold mb-2 text-red-600">Delete Property?</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete <span className="font-semibold">{confirmDelete.name}</span>? This cannot be undone.</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition" onClick={confirmDeleteProperty}>Delete</button>
              <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold shadow transition" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation dialog for page deletion */}
      {confirmDeletePage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-xs relative animate-pop-in">
            <h3 className="text-lg font-bold mb-2 text-red-600">Delete Page?</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete <span className="font-semibold">{confirmDeletePage.name}</span>? This cannot be undone.</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition" onClick={async () => {
                await handleDeletePage(confirmDeletePage.propertyId, confirmDeletePage.pageId);
                setConfirmDeletePage(null);
              }}>Delete</button>
              <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold shadow transition" onClick={() => setConfirmDeletePage(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation dialog for banner deletion */}
      {confirmDeleteBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-xs relative animate-pop-in">
            <h3 className="text-lg font-bold mb-2 text-red-600">Delete Banner?</h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete <span className="font-semibold">{confirmDeleteBanner.name}</span>? This cannot be undone.</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition" onClick={async () => {
                await handleRemoveBanner(confirmDeleteBanner.propertyId, confirmDeleteBanner.bannerId);
                setConfirmDeleteBanner(null);
              }}>Delete</button>
              <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold shadow transition" onClick={() => setConfirmDeleteBanner(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Snackbar component */}
      {snackbar.open && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded shadow-lg z-50 flex items-center min-w-[240px] max-w-xs transition-opacity duration-300 animate-fade-in
            ${snackbar.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
            ${snackbar.open ? 'opacity-100' : 'opacity-0'}`}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}
          role="alert"
        >
          <span className="flex-1 text-white text-sm font-medium pr-2">{snackbar.message}</span>
          <button
            className="ml-2 p-1 rounded hover:bg-white/10 focus:outline-none"
            onClick={() => setSnackbar(s => ({ ...s, open: false }))}
            aria-label="Close notification"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// --- PageScriptSelector component ---
function PageScriptSelector({ propertyId, pages, copiedScriptId, setCopiedScriptId }: {
  propertyId: string,
  pages: any[],
  copiedScriptId: string | null,
  setCopiedScriptId: (id: string | null) => void
}) {
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || "");
  const selectedPage = pages.find(pg => pg.id === selectedPageId) || pages[0];
  const selector = (selectedPage?.containers && selectedPage.containers.length > 0)
    ? selectedPage.containers.map((c: any) => c.name).join(',')
    : '.ad-slot';
  // Remove data-ad-selector from the generated script
  const script = `<script src=\"${window.location.origin}/js/adsend.js\" data-property=\"${propertyId}\" data-page=\"${selectedPageId}\" async></script>`;

  return (
    <div>
      <select
        className="mb-2 w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        value={selectedPageId}
        onChange={e => setSelectedPageId(e.target.value)}
      >
        {pages.map(pg => (
          <option key={pg.id} value={pg.id}>{pg.name} {pg.url ? `(${pg.url})` : ''}</option>
        ))}
      </select>
      <div className="relative">
        <textarea
          className="w-full text-xs font-mono bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded p-1 border border-gray-200 dark:border-gray-700 resize-none pr-8"
          style={{ minHeight: '44px', height: 'auto', overflow: 'hidden' }}
          rows={1}
          readOnly
          value={script}
          onFocus={e => e.target.select()}
        />
        <button
          className="absolute top-2 right-2 p-1 bg-transparent hover:bg-green-100 dark:hover:bg-green-900 rounded transition"
          onClick={() => {
            navigator.clipboard.writeText(script);
            setCopiedScriptId(`${propertyId}-${selectedPageId}`);
            setTimeout(() => setCopiedScriptId(null), 1200);
          }}
          type="button"
          tabIndex={-1}
          aria-label="Copy script"
        >
          {copiedScriptId === `${propertyId}-${selectedPageId}` ? (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
