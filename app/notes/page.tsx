import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/notes";
import NotesClient from "./Notes.client";

const PER_PAGE = 12;

type NotesPageProps = {
  searchParams: { search?: string; page?: string };
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const search = searchParams.search ?? "";
  const page = Number(searchParams.page ?? "1");

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ["notes", { search, page }],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        ...(search ? { search } : {}),
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient initialQuery={search} initialPage={page} />
    </HydrationBoundary>
  );
}
