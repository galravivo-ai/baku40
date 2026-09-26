export const INTERNAL_ONLY_MARK: string;
type Sources = {
  files: Record<string, { license?: string; type?: string }>;
  remote: { file?: string; thumb1280?: string; license: string; author?: string }[];
};
export function isPublishable(photo: string, photoNote: string, sources: Sources): boolean;
export function isRendering(photo: string, sources: Pick<Sources, "files">): boolean;
