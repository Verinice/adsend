import { useRef, useState } from "react";

export interface Banner {
  id: string;
  imageUrl: string;
  name: string;
  targetUrl?: string;
  adHtml?: string;
}

interface BannerUploadProps {
  banners: Banner[];
  onUpload: (file: File) => void;
  onRemove: (bannerId: string, containerId?: string) => void;
  onUpdate: (bannerId: string, data: Partial<Banner>) => void;
  iconStyle?: 'centered'; // Optional prop for icon style
}

export default function BannerUpload({ banners, onUpload, onRemove, onUpdate, iconStyle }: BannerUploadProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [modalData, setModalData] = useState({ targetUrl: "" });
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [modalAdHtml, setModalAdHtml] = useState<string>("");

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setModalData({ targetUrl: banner.targetUrl || "" });
    // Always regenerate adHtml with the latest targetUrl and imageUrl
    const adHtml = `<a href="${banner.targetUrl || '#'}" target="_blank" rel="noopener noreferrer"><img src="${banner.imageUrl}" alt="${banner.name || ''}" style="max-width:100%;height:auto;display:block;" /></a>`;
    setModalAdHtml(adHtml);
  };

  const closeModal = () => {
    setEditingBanner(null);
    setModalData({ targetUrl: "" });
  };

  const handleSave = async () => {
    if (editingBanner) {
      setRegenerating(true);
      await new Promise(res => setTimeout(res, 600)); // Simulate loader
      const newAdHtml = `<a href="${modalData.targetUrl ? modalData.targetUrl : '#'}" target="_blank" rel="noopener noreferrer"><img src="${editingBanner.imageUrl}" alt="${editingBanner.name}" style="max-width:100%;height:auto;display:block;" /></a>`;
      setModalAdHtml(newAdHtml);
      onUpdate(editingBanner.id, { targetUrl: modalData.targetUrl, adHtml: newAdHtml });
      setRegenerating(false);
    }
  };

  return (
    <div className="mt-4 ml-4">
      <div className="flex flex-wrap gap-3 mb-2">
        {banners.length === 0 && (
          <span className="text-gray-300 italic text-xs">No banners uploaded.</span>
        )}
        {/* Only show banners with unique adHtml */}
        {(() => {
          const seen = new Set<string>();
          return banners.filter(b => {
            if (!b.adHtml) return true;
            if (seen.has(b.adHtml)) return false;
            seen.add(b.adHtml);
            return true;
          }).map(banner => (
            <div
              key={banner.id}
              className={`relative flex flex-col items-center border border-blue-100 rounded p-2 bg-blue-50 cursor-pointer group w-32 min-h-24 h-40 justify-center`}
              onClick={() => openEditModal(banner)}
            >
              {banner.adHtml && (
                <span className="flex w-full h-full min-h-24 items-center justify-center overflow-hidden" dangerouslySetInnerHTML={{ __html: banner.adHtml }} />
              )}
              {/* Edit and Delete icons, smaller and only visible on hover */}
              <button
                className="absolute top-1 left-1 text-blue-500 bg-white rounded-full p-1 shadow hover:bg-blue-100 z-20 opacity-0 group-hover:opacity-100 transition"
                type="button"
                title="Edit banner"
                onClick={e => { e.stopPropagation(); openEditModal(banner); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
                </svg>
              </button>
              <button
                className="absolute top-1 right-1 text-red-500 bg-white rounded-full p-1 shadow hover:bg-red-100 z-20 opacity-0 group-hover:opacity-100 transition"
                type="button"
                title="Remove banner"
                onClick={e => { e.stopPropagation(); onRemove(banner.id, ''); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ));
        })()}
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          className="hidden dark:bg-gray-900 dark:text-gray-100"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              onUpload(e.target.files[0]);
              e.target.value = "";
            }
          }}
        />
      </div>
      {/* Modal for editing banner meta data */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={closeModal}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-bold mb-4 text-blue-700">Preview</h3>
            <div className="w-full flex items-center justify-center mb-3 min-h-[80px]">
              <span className="block" dangerouslySetInnerHTML={{ __html: modalAdHtml }} />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1 text-gray-600">Target URL</label>
              <input
                className="dark:bg-transparent border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                placeholder="https://example.com"
                value={modalData.targetUrl}
                onChange={e => setModalData({ ...modalData, targetUrl: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-600">Generated Ad HTML</label>
                <button
                  type="button"
                  className="p-1 text-blue-600 hover:text-blue-800 relative"
                  title="Copy ad HTML"
                  onClick={() => {
                    navigator.clipboard.writeText(modalAdHtml);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000);
                  }}
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" className="fill-none" />
                      <rect x="3" y="3" width="13" height="13" rx="2" ry="2" className="fill-none" />
                    </svg>
                  )}
                </button>
              </div>
              <textarea
                className="border border-gray-300 rounded px-2 py-1 w-full text-xs font-mono bg-gray-50 resize-none"
                rows={3}
                value={modalAdHtml}
                readOnly
              />
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition flex items-center justify-center gap-2"
              onClick={handleSave}
              type="button"
            >
              {editingBanner?.adHtml ? (
                <>
                  {regenerating && (
                    <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  )}
                  Regenerate
                </>
              ) : 'Generate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
