import { CollectionPage } from "@/components/listing/CollectionPage";
import { getCollection } from "@/lib/content";
import { collectionMetadata } from "@/lib/seo";

export function generateMetadata() {
  return collectionMetadata(getCollection("hotels"));
}

export default function Page() {
  return <CollectionPage collectionKey="hotels" />;
}
