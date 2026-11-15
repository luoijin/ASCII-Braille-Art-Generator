import figlet from 'figlet';

type Layout = 'default' | 'full' | 'fitted' | 'controlled smushing' | 'universal smushing';
const loaded = new Set<string>();

export async function renderFiglet(text: string, font: string, layout: Layout): Promise<string> {
  if (!loaded.has(font)) {
    const res = await fetch(`/fonts/figlet/${encodeURIComponent(font)}.flf`);
    if (!res.ok) throw new Error(`font-not-found: ${font}`);
    figlet.parseFont(font, await res.text());
    loaded.add(font);
  }
  return figlet.text(text, { font, horizontalLayout: layout });
}