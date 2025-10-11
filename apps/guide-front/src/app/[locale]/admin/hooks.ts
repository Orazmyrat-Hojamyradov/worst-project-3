"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010"; // adjust to your backend

// ----------------- FETCH ALL -----------------
export function useFetchUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/guides`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch universities");
      return res.json();
    },
  });
}

// ----------------- CREATE -----------------
export function useCreateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_URL}/api/guides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create university");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

// ----------------- UPDATE -----------------
export function useUpdateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await fetch(`${API_URL}/api/guides/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res) throw new Error("Failed to update university");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

// ----------------- DELETE -----------------
export function useDeleteUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/guides/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete university");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}
