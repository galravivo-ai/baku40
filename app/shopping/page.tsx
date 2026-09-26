import { CollectionPage } from "@/components/listing/CollectionPage";
import { getCollection } from "@/lib/content";
import { collectionMetadata } from "@/lib/seo";

export function generateMetadata() {
  return collectionMetadata(getCollection("shopping"));
}

export default function Page() {
  return <CollectionPage collectionKey="shopping" />;
}
