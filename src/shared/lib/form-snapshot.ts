type FormSnapshot = Array<[string, string[]]>;

type NamedControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isNamedControl(element: Element): element is NamedControl {
  return (
    (element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement) &&
    element.name.length > 0
  );
}

export function captureFormSnapshot(form: HTMLFormElement): FormSnapshot {
  const values = new Map<string, string[]>();

  for (const [name, value] of new FormData(form).entries()) {
    const normalizedValue = value instanceof File ? value.name : String(value);
    const existing = values.get(name);

    if (existing) {
      existing.push(normalizedValue);
      continue;
    }

    values.set(name, [normalizedValue]);
  }

  return [...values.entries()].sort(([left], [right]) => left.localeCompare(right));
}

export function formMatchesSnapshot(form: HTMLFormElement, snapshot: FormSnapshot | null) {
  if (!snapshot) {
    return true;
  }

  return JSON.stringify(captureFormSnapshot(form)) === JSON.stringify(snapshot);
}

export function restoreFormSnapshot(form: HTMLFormElement, snapshot: FormSnapshot | null) {
  if (!snapshot) {
    form.reset();
    return;
  }

  const valuesByName = new Map(snapshot.map(([name, values]) => [name, [...values]]));
  const consumedIndexes = new Map<string, number>();

  for (const element of Array.from(form.elements)) {
    if (!isNamedControl(element)) {
      continue;
    }

    const values = valuesByName.get(element.name) ?? [];

    if (element instanceof HTMLInputElement) {
      if (element.type === "checkbox") {
        if (values.length === 0) {
          element.checked = false;
          continue;
        }

        const expectedValues = new Set(values);
        element.checked = expectedValues.has(element.value || "on");
        continue;
      }

      if (element.type === "radio") {
        element.checked = values[0] === element.value;
        continue;
      }
    }

    if (element instanceof HTMLSelectElement && element.multiple) {
      const selectedValues = new Set(values);

      for (const option of Array.from(element.options)) {
        option.selected = selectedValues.has(option.value);
      }

      continue;
    }

    const consumedIndex = consumedIndexes.get(element.name) ?? 0;
    const nextValue = values[consumedIndex] ?? "";

    element.value = nextValue;
    consumedIndexes.set(element.name, consumedIndex + 1);
  }
}
