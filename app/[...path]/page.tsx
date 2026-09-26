import { notFound } from "next/navigation";
import { EditorialView } from "@/components/editorial/EditorialView";
import { getEditorialPage, getEditorialPages } from "@/lib/content";
import { editorialMetadata } from "@/lib/editorial";

// Every file in content/pages/editorial/ becomes a page at its `url`
// (attraction pages are served by app/attractions/[slug]).

export const dynamicParams = false;

export function generateStaticParams() {
  return getEditorialPages()
    .filter((p) => !p.url.startsWith("/attractions/"))
    .map((p) => ({ path: p.url.split("/").filter(Boolean) }));
}

type Props = { params: Promise<{ path: string[] }> };

async function load(params: Props["params"]) {
  const { path } = await params;
  const page = getEditorialPage(`/${path.map(decodeURIComponent).join("/")}/`);
  if (!page) notFound();
  return page;
}

export async function generateMetadata({ params }: Props) {
  return editorialMetadata(await load(params));
}

export default async function EditorialRoute({ params }: Props) {
  return <EditorialView page={await load(params)} />;
}
