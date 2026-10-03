export function formatContext(chunks: string[]): string {
  if (!chunks || chunks.length === 0) return "";
  return chunks.join("\n\n---\n\n");
}

export function buildRagContext(params: {
  sourceChunks: string[];
  materialTitle?: string;
}): { context: string; formattedSources: string } {
  const context = formatContext(params.sourceChunks);
  const formattedSources = params.materialTitle
    ? `Source: ${params.materialTitle}`
    : "Source Material";
  return { context, formattedSources };
}
