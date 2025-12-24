// lib/api/universities.ts (Server-side API functions)
"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010";

export async function fetchUniversities() {
  const res = await fetch(`${API_URL}/api/guides`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store", // or 'force-cache' depending on your needs
  });
  if (!res.ok) throw new Error("Failed to fetch universities");
  return res.json();
}

export async function createUniversity(data: any) {
  const res = await fetch(`${API_URL}/api/guides`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create university");
  return res.json();
}

export async function updateUniversity(id: string, data: any) {
  const res = await fetch(`${API_URL}/api/guides/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update university");
  return res.json();
}

export async function deleteUniversity(id: string) {
  const res = await fetch(`${API_URL}/api/guides/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete university");
  return res.json();
}