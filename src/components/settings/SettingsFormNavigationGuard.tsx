"use client";

interface SettingsNavigateEvent extends Event {
  readonly navigationType: string;
  readonly destination: { readonly sameDocument: boolean };
}

interface MountedSettingsForm {
  readonly hasProtectedAttempt: () => boolean;
  readonly hasDirtyDraft: () => boolean;
  readonly reportBlocked: () => void;
}

const mountedForms = new Set<MountedSettingsForm>();
let removeListeners: (() => void) | undefined;

export function confirmSettingsDraftDiscard() {
  return window.confirm("Du har osparade ändringar. Vill du lämna utkastet?");
}

export function installSettingsFormNavigationGuard(form: MountedSettingsForm) {
  mountedForms.add(form);
  removeListeners ??= attachDepartureListeners();
  return () => {
    mountedForms.delete(form);
    if (mountedForms.size === 0) {
      removeListeners?.();
      removeListeners = undefined;
    }
  };
}

function attachDepartureListeners() {
  function allowDeparture(confirmDraft: boolean) {
    let hasDirtyDraft = false;
    for (const form of mountedForms) {
      if (form.hasProtectedAttempt()) {
        form.reportBlocked();
        return false;
      }
      hasDirtyDraft ||= form.hasDirtyDraft();
    }
    return !confirmDraft || !hasDirtyDraft || confirmSettingsDraftDiscard();
  }

  const beforeUnload = (event: BeforeUnloadEvent) => {
    for (const form of mountedForms) {
      if (!form.hasProtectedAttempt() && !form.hasDirtyDraft()) continue;
      event.preventDefault();
      event.returnValue = "";
      return;
    }
  };

  const onLink = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
    const url = new URL(link.href);
    // Summary links and in-page anchors stay usable with a dirty draft.
    if (url.pathname === location.pathname && url.search === location.search && url.origin === location.origin) return;
    // External documents use the browser's own beforeunload confirmation.
    if (!allowDeparture(url.origin === location.origin)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  // Cancel before committing the history traversal. A popstate restoration
  // would change the active entry and could replace a mounted attempt.
  const navigation = (window as Window & { navigation?: EventTarget }).navigation;
  const onNavigate = (event: Event) => {
    const traversal = event as SettingsNavigateEvent;
    if (event.defaultPrevented || !event.cancelable || traversal.navigationType !== "traverse") return;
    if (!allowDeparture(traversal.destination.sameDocument)) event.preventDefault();
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
