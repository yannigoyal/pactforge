import { readFile } from "node:fs/promises";
import path from "node:path";

export interface TemplateCatalogEntry {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  path: string;
  format: string;
  license: { name: string; url: string; file: string };
}

/** Reads templates/catalog.json, the metadata index of available templates. */
export async function loadCatalog(): Promise<TemplateCatalogEntry[]> {
  const filePath = path.join(process.cwd(), "..", "templates", "catalog.json");
  const raw = JSON.parse(await readFile(filePath, "utf-8"));
  return raw.templates;
}

export async function findCatalogEntry(id: string): Promise<TemplateCatalogEntry | undefined> {
  const entries = await loadCatalog();
  return entries.find((entry) => entry.id === id);
}
