"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

import { fetchNotes } from "@/lib/api";

import SearchBox from "@/components/SearchBox/SearchBox";
import NoteForm from "@/components/NoteForm/NoteForm";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";

import css from "./NotesPage.module.css";

const PER_PAGE = 12;

type NotesClientProps = {
  initialQuery: string;
  initialPage: number;
};

export default function NotesClient({ initialQuery, initialPage }: NotesClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search.trim()) params.set("q", search.trim());
    if (page > 1) params.set("page", String(page));

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }, [search, page, router, pathname]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["notes", { search, page, perPage: PER_PAGE }],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        ...(search ? { search } : {}),
      }),
  });

  if (isLoading) return <p>Loading, please wait...</p>;
  if (error || !data) return <p>Something went wrong.</p>;

  return (
    <main className={css.container}>
      <SearchBox
        onSearch={(value: string) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <NoteForm />

      <NoteList notes={data.notes} />

      <Pagination
        page={page}
        totalPages={data.totalPages}
        onPageChange={(newPage: number) => setPage(newPage)}
      />
    </main>
  );
}
