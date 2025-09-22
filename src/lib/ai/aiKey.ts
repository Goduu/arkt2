"use client";

import { EncryptedBlob, EncryptedKeyBlob, encryptStringToBlob } from "../server/crypto";


const STORAGE_KEY = "arkt.enc.openai";

export function hasStoredAIKey(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    console.error('Error checking for stored AI key', e);
    return false;
  }
}

export function loadEncryptedAIKey(): EncryptedKeyBlob | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as EncryptedBlob;
  } catch {
    return undefined;
  }
}

export async function encryptAndSaveAIKey(plainApiKey: string): Promise<void> {
  const secret = (process.env.NEXT_PUBLIC_OPENAI_KEY_SECRET || "") as string;
  if (!secret) throw new Error("Missing NEXT_PUBLIC_OPENAI_KEY_SECRET");
  const enc = await encryptStringToBlob(plainApiKey, secret);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(enc));
  try { window.dispatchEvent(new CustomEvent('arkt:key-updated')); } catch {
    console.warn('Error dispatching event for key update');
  }
}

export function clearAIKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing AI key', e);
    // ignore
  }
  try { window.dispatchEvent(new CustomEvent('arkt:key-updated')); } catch {
    console.warn('Error dispatching event for key update');
  }
}

export function setEncryptedAIKey(blob: EncryptedBlob | undefined | null): void {
  try {
    if (!blob) {
      localStorage.removeItem(STORAGE_KEY);
      try { window.dispatchEvent(new CustomEvent('arkt:key-updated')); } catch {
        console.warn('Error dispatching event for key update');
      }
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
    try { window.dispatchEvent(new CustomEvent('arkt:key-updated')); } catch {
      console.warn('Error dispatching event for key update');
    }
  } catch (e) {
    console.error('Error setting encrypted AI key', e);
  }
}


