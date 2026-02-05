import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import NotesClient from "./Notes.client";

const PER_PAGE = 12;

type NotesPageProps = {
  searchParams: { q?: string; page?: string };
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const q = searchParams.q ?? "";

  const pageFromParams = Number(searchParams.page ?? "1");
  const page = Number.isFinite(pageFromParams) && pageFromParams > 0 ? pageFromParams : 1;

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ["notes", { search: q, page, perPage: PER_PAGE }],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        ...(q ? { search: q } : {}),
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient initialQuery={q} initialPage={page} />
    </HydrationBoundary>
  );
}
