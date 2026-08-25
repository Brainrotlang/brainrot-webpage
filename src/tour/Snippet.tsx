// src/tour/Snippet.tsx
//
// Non-editable Brainrot in lesson prose. Matches the plain code blocks on
// the landing page (GetStarted.tsx) rather than mounting a CodeMirror
// instance per snippet: a paragraph illustration that looks like the
// editor invites edits that go nowhere.

export function Snippet({ children }: { children: string }) {
  return (
    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-3">
      <code className="text-green-400 text-sm">{children}</code>
    </pre>
  );
}
