import { createContext, useContext, useState, type ReactNode } from "react";
import { fr } from "./fr";
import { en } from "./en";

export type Language = "fr" | "en";
export type Dictionary = typeof fr;

const STORAGE_KEY = "ewa_senegal_language";
const DICTIONARIES: Record<Language, Dictionary> = { fr, en };

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "fr";
}

function resolveKey(dict: Dictionary, key: string): string | undefined {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict) as string | undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  function setLanguage(lang: Language) {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const value = resolveKey(DICTIONARIES[language], key) ?? resolveKey(DICTIONARIES.fr, key);
    if (typeof value !== "string") return key;
    return interpolate(value, vars);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation doit être utilisé à l'intérieur d'un LanguageProvider");
  }
  return ctx;
}
