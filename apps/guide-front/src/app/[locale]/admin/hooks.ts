// hooks/useUniversities.ts (Client-side TanStack Query hooks)
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUniversities,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from "@/api/api2";

// ----------------- FETCH ALL -----------------
export function useFetchUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: fetchUniversities,
  });
}

// ----------------- CREATE -----------------
export function useCreateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

// ----------------- UPDATE -----------------
export function useUpdateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateUniversity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}

// ----------------- DELETE -----------------
export function useDeleteUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUniversity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
    },
  });
}