"use client";

interface SettingsNavigateEvent extends Event {
  readonly navigationType: string;
}

export function installSettingsFormNavigationGuard(
  isProtected: () => boolean,
  allowReplacement: () => boolean,
) {
  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!isProtected()) return;
    event.preventDefault();
    event.returnValue = "";
  };

  const onLink = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
    const url = new URL(link.href);
    // Summary links and in-page anchors stay usable with a dirty draft.
    if (url.pathname === location.pathname && url.search === location.search && url.origin === location.origin) return;
    if (!allowReplacement()) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // Cancel before committing the history traversal. A popstate restoration
  // would change the active entry and could replace a mounted attempt.
  const navigation = (window as Window & { navigation?: EventTarget }).navigation;
  const onNavigate = (event: Event) => {
    if (event.defaultPrevented || !event.cancelable || (event as SettingsNavigateEvent).navigationType !== "traverse") return;
    if (!allowReplacement()) event.preventDefault();
  };

  window.addEventListener("beforeunload", beforeUnload);
  document.addEventListener("click", onLink, true);
  navigation?.addEventListener("navigate", onNavigate);
  return () => {
    window.removeEventListener("beforeunload", beforeUnload);
    document.removeEventListener("click", onLink, true);
    navigation?.removeEventListener("navigate", onNavigate);
  };
}

export function hasChangedSettingsFields(form: HTMLFormElement): boolean {
  return Array.from(form.elements).some(control => {
    if (control instanceof HTMLInputElement && control.type !== "hidden") {
      return control.value !== control.defaultValue;
    }
    if (control instanceof HTMLSelectElement) {
      const initial = Array.from(control.options).findIndex(option => option.defaultSelected);
      return control.selectedIndex !== Math.max(0, initial);
    }
    return false;
  });
}
