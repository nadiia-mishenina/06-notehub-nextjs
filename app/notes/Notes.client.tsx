"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { usePathname, useRouter } from "next/navigation";

import { fetchNotes } from "@/lib/api";

import SearchBox from "@/components/SearchBox/SearchBox";
import NoteForm from "@/components/NoteForm/NoteForm";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";

import css from "./NotesPage.module.css";

const PER_PAGE = 12;

type NotesClientProps = {
  initialQuery: string;
  initialPage: number;
};

export default function NotesClient({ initialQuery, initialPage }: NotesClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  // what user types (instant)
  const [searchInput, setSearchInput] = useState(initialQuery);
  // debounced value used for запросов
  const [debouncedSearch] = useDebounce(searchInput, 500);

  const [page, setPage] = useState(initialPage);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // when debouncedSearch changes -> reset page to 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // sync URL with debouncedSearch + page
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [debouncedSearch, page, router, pathname]);

  const queryKey = useMemo(
    () => ["notes", { search: debouncedSearch, page, perPage: PER_PAGE }],
    [debouncedSearch, page]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
  });

  if (isLoading) return <p>Loading, please wait...</p>;
  if (error || !data) return <p>Something went wrong.</p>;

  return (
    <main className={css.container}>
      <div className={css.header}>
        <SearchBox
          onSearch={(value: string) => {
            setSearchInput(value);
          }}
        />

        <button type="button" className={css.button} onClick={openModal}>
          Create note
        </button>
      </div>

      <NoteList notes={data.notes} />

      {data.totalPages > 1 && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
      )}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm onCancel={closeModal} />
        </Modal>
      )}
    </main>
  );
}
