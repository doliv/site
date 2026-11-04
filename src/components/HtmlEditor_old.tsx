"use client";

import { useEffect, useRef, useState } from "react";

type Props = { name: string; label: string; defaultValue?: string };

const hasContent = (html: string) => html.replace(/<[^>]*>|&nbsp;/g, "").trim().length > 0;

export default function HtmlEditor({ name, label, defaultValue = "" }: Props) {
  const area = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);
  const [source, setSource] = useState(false);

  // Injecte le HTML dans la zone d’édition au chargement et au retour du mode « HTML ».
  useEffect(() => {
    if (!source && area.current) area.current.innerHTML = html;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  useEffect(() => {
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, []);

  const sync = () => area.current && setHtml(area.current.innerHTML);

  const run = (cmd: string, value?: string) => {
    area.current?.focus();
    document.execCommand(cmd, false, value);
    sync();
  };

  const block = (tag: string) => {
    const current = document.queryCommandValue("formatBlock").toLowerCase();
    run("formatBlock", current === tag ? "p" : tag);
  };

  const link = () => {
    const url = window.prompt("Adresse du lien (https://…)");
    if (!url) return;
    if (!/^(https?:\/\/|mailto:)/i.test(url)) {
      window.alert("L’adresse doit commencer par https://, http:// ou mailto:");
      return;
    }
    run("createLink", url);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
    sync();
  };

  const tools: { label: string; title: string; on: () => void; style?: React.CSSProperties }[] = [
    { label: "Titre", title: "Titre de section", on: () => block("h2") },
    { label: "Sous-titre", title: "Sous-titre", on: () => block("h3") },
    { label: "G", title: "Gras", on: () => run("bold"), style: { fontWeight: 800 } },
    { label: "I", title: "Italique", on: () => run("italic"), style: { fontStyle: "italic" } },
    { label: "Liste", title: "Liste à puces", on: () => run("insertUnorderedList") },
    { label: "1. 2.", title: "Liste numérotée", on: () => run("insertOrderedList") },
    { label: "Citation", title: "Citation", on: () => block("blockquote") },
    { label: "Lien", title: "Insérer un lien", on: link },
    { label: "Retirer le lien", title: "Retirer le lien", on: () => run("unlink") },
  ];

  return (
    <div className="field">
      <span id={`${name}-label`}>{label}</span>
      <div className="ed">
        <div className="ed-bar" role="toolbar" aria-label="Mise en forme">
          {!source &&
            tools.map((t) => (
              <button
                key={t.title}
                type="button"
                title={t.title}
                aria-label={t.title}
                style={t.style}
                onMouseDown={(e) => e.preventDefault()} // garde la sélection dans le texte
                onClick={t.on}
              >
                {t.label}
              </button>
            ))}
          <button
            type="button"
            className="ed-src-toggle"
            aria-pressed={source}
            onClick={() => setSource((s) => !s)}
          >
            {source ? "Revenir à l’éditeur" : "Code HTML"}
          </button>
        </div>
        {source ? (
          <textarea
            className="ed-src"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={14}
            spellCheck={false}
            aria-labelledby={`${name}-label`}
          />
        ) : (
          <div
            ref={area}
            className="ed-area prose"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-labelledby={`${name}-label`}
            onInput={sync}
            onBlur={sync}
            onPaste={onPaste}
          />
        )}
      </div>
      <input type="hidden" name={name} value={hasContent(html) ? html : ""} />
    </div>
  );
}
