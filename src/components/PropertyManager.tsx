"use client";
import { useState } from "react";
import type { Property } from "../types";

interface PropertyManagerProps {
  user: string;
}

export function PropertyManager({ user }: PropertyManagerProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [newProp, setNewProp] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Add property
  const handleAdd = () => {
    if (!newProp.trim()) return;
    setProperties([
      ...properties,
      { id: Date.now().toString(), name: newProp.trim(), pages: [] },
    ]);
    setNewProp("");
  };

  // Delete property
  const handleDelete = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  // Start editing
  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  // Save edit
  const handleSave = (id: string) => {
    setProperties(properties.map((p) =>
      p.id === id ? { ...p, name: editValue.trim() } : p
    ));
    setEditingId(null);
    setEditValue("");
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="flex h-[70vh] min-h-[500px] w-full max-w-5xl mx-auto bg-white/90 shadow-2xl rounded-2xl border border-gray-100 backdrop-blur overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-green-50 to-green-100 border-r border-gray-200 flex flex-col p-6 gap-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center justify-center w-10 h-10 bg-green-200 rounded-full">
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5h3a1 1 0 011 1v4a1 1 0 01-1 1h-3m-10 0v6a2 2 0 002 2h6a2 2 0 002-2v-6m-10 0h10" /></svg>
          </span>
          <span className="font-bold text-lg text-green-800">Ad Dashboard</span>
        </div>
        <div className="text-gray-700 font-semibold mb-2">{user}</div>
        <nav className="flex flex-col gap-2 text-gray-600 text-base">
          <span className="font-bold text-green-700">Properties</span>
          <ul className="flex flex-col gap-1">
            {properties.map((p) => (
              <li key={p.id} className="truncate px-2 py-1 rounded hover:bg-green-200 cursor-pointer text-sm font-medium text-green-900">
                {p.name}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto text-xs text-gray-400">&copy; {new Date().getFullYear()} Ad Dashboard</div>
      </aside>
      {/* Main Section */}
      <section className="flex-1 flex flex-col p-10 overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Manage Properties</h2>
        <form
          className="flex gap-2 mb-8"
          onSubmit={e => {
            e.preventDefault();
            if (!newProp.trim()) return;
            setProperties([
              ...properties,
              { id: Date.now().toString(), name: newProp.trim(), pages: [] },
            ]);
            setNewProp("");
          }}
        >
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            placeholder="Add new property (website)"
            value={newProp}
            onChange={e => setNewProp(e.target.value)}
          />
          <button className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition text-white px-4 py-2 rounded-lg font-semibold shadow-lg" type="submit">
            Add
          </button>
        </form>
        <ul className="space-y-3">
          {properties.length === 0 && (
            <li className="text-gray-400 italic text-center">No properties yet. Add your first website!</li>
          )}
          {properties.map((p) => (
            <li key={p.id} className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition shadow-sm">
              {editingId === p.id ? (
                <>
                  <input
                    className="border border-green-400 rounded-lg px-2 py-1 flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="text-green-700 font-semibold mr-2 hover:underline"
                    onClick={() => handleSave(p.id)}
                    type="button"
                  >
                    Save
                  </button>
                  <button
                    className="text-gray-400 hover:text-gray-600 font-semibold hover:underline"
                    onClick={handleCancel}
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-700 flex-1">{p.name}</span>
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                      onClick={() => handleEdit(p.id, p.name)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 font-semibold hover:underline"
                      onClick={() => handleDelete(p.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
