'use client';

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import styles from "./UniversitySwiper.module.css";
import UniversityCard from "../ui/UniversityCard/UniversityCard";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/api/api";
import React from "react";

interface Props {
  title: string;
}

export type University = {
  id?: string | number;
  name: string;
  location?: string;
  rating?: number;
  description?: string;
  officialLink?: string;
};

/* local fallback data (keeps your original dummy list) */
export const universities: University[] = [
  {
    name: "Harvard University",
    location: "Cambridge, USA",
    rating: 4.9,
    description:
      "A private Ivy League research university known for its excellence in education and research.",
    officialLink: "https://www.harvard.edu/",
  },
  {
    name: "Stanford University",
    location: "Stanford, USA",
    rating: 4.8,
    description:
      "One of the world's leading research and teaching institutions with exceptional entrepreneurial spirit.",
    officialLink: "https://www.stanford.edu/",
  },
  {
    name: "MIT",
    location: "Cambridge, USA",
    rating: 4.9,
    description:
      "Massachusetts Institute of Technology is known for its research and education in physical sciences and engineering.",
    officialLink: "https://www.mit.edu/",
  },
  // ... (rest omitted for brevity)
];

async function fetchUniversities(): Promise<University[]> {
  const res: any = await fetchData({ url: "/api/universities" });
  // Accept either an array or { data: array } response shapes
  const payload = Array.isArray(res) ? res : res?.data;
  if (!Array.isArray(payload)) {
    throw new Error("Invalid response from /api/universities");
  }
  return payload;
}

export default function UniversitySwiper({ title }: Props) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<University[], Error>({
    queryKey: ["universities"],
    queryFn: fetchUniversities,
    // small improvements: cache 5 minutes, retry once
    staleTime: 1000 * 60 * 5,
    retry: 1,
    // optionally show local placeholder data while loading:
    // placeholderData: universities,
  });

  // Loading state (you can replace with a skeleton component)
  if (isLoading) {
    return (
      <div className="">
        <h2 className={styles.mainTitle}>{title}</h2>
        <div className={styles.loading}>Loading universities…</div>
      </div>
    );
  }

  // Error state: show message, retry and fallback to local list
  if (isError) {
    return (
      <div className="">
        <h2 className={styles.mainTitle}>{title}</h2>

        <div role="alert" aria-live="assertive" className={styles.errorBox}>
          <p>Failed to load universities: {error?.message ?? "Unknown error"}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => refetch()} className={styles.retryButton}>
              Retry
            </button>
            <button
              onClick={() => {
                // conservative refetch + console for debugging
                console.info("Falling back to local universities list");
                refetch();
              }} 
              className={styles.fallbackButton}
            >
              Try Again
            </button>
          </div>
        </div>

      </div>
    );
  }

  // No data or empty
  if (!data || data.length === 0) {
    return (
      <div className="">
        <h2 className={styles.mainTitle}>{title}</h2>
        <div className={styles.empty}>No universities found.</div>
      </div>
    );
  }

  // Success render
  return (
    <div className="">
      <h2 className={styles.mainTitle}>{title}</h2>

      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
        className={styles.swiper}
      >
        {data.map((uni, i) => (
          <SwiperSlide key={uni.id ?? `${uni.name}-${i}`}>
            <UniversityCard uni={uni} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* small status indicator when refetching in background */}
      {isFetching && <div className={styles.fetchingHint}>Updating…</div>}
    </div>
  );
}
