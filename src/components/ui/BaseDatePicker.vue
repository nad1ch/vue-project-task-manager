<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { i18n, t } from '@/i18n';
import AppIcon from './AppIcon.vue';

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    modelValue: string;
    error?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    minDate?: string;
  }>(),
  { disabled: false },
);
const emit = defineEmits<{ 'update:modelValue': [string]; blur: [] }>();

const root = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const popRef = ref<HTMLElement | null>(null);
const open = ref(false);

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function parseIso(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

const todayIso = toIso(new Date());

// The month currently shown in the popover.
const view = ref(parseIso(props.modelValue) ?? new Date());
// The focused day (keyboard), as ISO.
const focusedIso = ref(props.modelValue || todayIso);

watch(open, (isOpen) => {
  if (isOpen) {
    const base = parseIso(props.modelValue) ?? new Date();
    view.value = new Date(base.getFullYear(), base.getMonth(), 1);
    focusedIso.value = props.modelValue || todayIso;
    focusActiveDay();
  }
});

// Move DOM focus to the focused day so arrow keys keep working after the
// trigger loses focus (roving-tabindex pattern).
function focusActiveDay(): void {
  void nextTick(() => {
    popRef.value?.querySelector<HTMLElement>(`[data-iso="${focusedIso.value}"]`)?.focus();
  });
}

const localeTag = computed(() => (i18n.global.locale.value === 'uk' ? 'uk-UA' : 'en-GB'));

const triggerLabel = computed(() => {
  const date = parseIso(props.modelValue);
  if (!date) return '';
  return new Intl.DateTimeFormat(localeTag.value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
});

const monthTitle = computed(() =>
  new Intl.DateTimeFormat(localeTag.value, { month: 'long', year: 'numeric' }).format(view.value),
);

const weekdays = computed<string[]>(() => {
  const fmt = new Intl.DateTimeFormat(localeTag.value, { weekday: 'short' });
  // Start the week on Monday (2024-01-01 was a Monday).
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
});

interface DayCell {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isFocused: boolean;
}

const days = computed<DayCell[]>(() => {
  const year = view.value.getFullYear();
  const month = view.value.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = toIso(date);
    return {
      iso,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: iso === todayIso,
      isSelected: iso === props.modelValue,
      isDisabled: props.minDate !== undefined && iso < props.minDate,
      isFocused: iso === focusedIso.value,
    };
  });
});

function shiftMonth(delta: number): void {
  view.value = new Date(view.value.getFullYear(), view.value.getMonth() + delta, 1);
}
function select(cell: DayCell): void {
  if (cell.isDisabled) return;
  emit('update:modelValue', cell.iso);
  close(true, true);
}
function close(emitBlur = true, restoreFocus = false): void {
  if (!open.value) return;
  open.value = false;
  if (emitBlur) emit('blur');
  if (restoreFocus) void nextTick(() => triggerRef.value?.focus());
}

function moveFocus(deltaDays: number): void {
  const current = parseIso(focusedIso.value) ?? new Date();
  let next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + deltaDays);
  // Disabled days are exactly the past (before minDate); clamp so focus never lands on one.
  if (props.minDate !== undefined && toIso(next) < props.minDate) {
    next = parseIso(props.minDate) ?? next;
  }
  focusedIso.value = toIso(next);
  if (next.getMonth() !== view.value.getMonth() || next.getFullYear() !== view.value.getFullYear()) {
    view.value = new Date(next.getFullYear(), next.getMonth(), 1);
  }
  focusActiveDay();
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  if (!open.value) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      open.value = true;
    }
    return;
  }
  switch (event.key) {
    case 'Escape':
      event.preventDefault();
      close(true, true);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      moveFocus(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();
      moveFocus(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveFocus(-7);
      break;
    case 'ArrowDown':
      event.preventDefault();
      moveFocus(7);
      break;
    case 'Enter':
    case ' ': {
      event.preventDefault();
      const cell = days.value.find((d) => d.iso === focusedIso.value);
      if (cell) select(cell);
      break;
    }
    default:
      break;
  }
}

function onTriggerBlur(event: FocusEvent): void {
  // Don't fire blur when focus moves into the open popover; emit once the control truly loses focus.
  if (!open.value && !root.value?.contains(event.relatedTarget as Node)) emit('blur');
}
function onDocumentPointerDown(event: PointerEvent): void {
  if (open.value && root.value && !root.value.contains(event.target as Node)) close();
}
onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown));
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown));
</script>

<template>
  <div ref="root" class="field datepicker" :class="{ 'datepicker--open': open }">
    <label :for="id" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true"> *</span>
    </label>

    <button
      :id="id"
      ref="triggerRef"
      type="button"
      class="field__control datepicker__trigger"
      :class="{ 'field__control--error': Boolean(error) }"
      :aria-invalid="Boolean(error)"
      :aria-expanded="open"
      aria-haspopup="dialog"
      :aria-describedby="error ? `${id}-error` : hint ? `${id}-hint` : undefined"
      :disabled="disabled"
      @click="open = !open"
      @keydown="onKeydown"
      @blur="onTriggerBlur"
    >
      <span :class="{ 'datepicker__placeholder': !triggerLabel }">
        {{ triggerLabel || t('datePicker.placeholder') }}
      </span>
      <AppIcon name="clock" :size="15" class="datepicker__icon" />
    </button>

    <Transition name="select-pop">
      <div
        v-if="open"
        ref="popRef"
        class="datepicker__pop"
        role="dialog"
        aria-modal="false"
        :aria-label="monthTitle"
        @keydown="onKeydown"
      >
        <header class="datepicker__head">
          <button type="button" class="datepicker__nav" :aria-label="t('datePicker.prevMonth')" @click="shiftMonth(-1)">
            <AppIcon name="arrow-left" :size="15" />
          </button>
          <span class="datepicker__title">{{ monthTitle }}</span>
          <button type="button" class="datepicker__nav" :aria-label="t('datePicker.nextMonth')" @click="shiftMonth(1)">
            <AppIcon name="chevron-right" :size="15" />
          </button>
        </header>
        <div class="datepicker__weekdays">
          <span v-for="(wd, i) in weekdays" :key="i" class="datepicker__weekday">{{ wd }}</span>
        </div>
        <div class="datepicker__grid">
          <button
            v-for="cell in days"
            :key="cell.iso"
            type="button"
            class="datepicker__day"
            :class="{
              'datepicker__day--muted': !cell.inMonth,
              'datepicker__day--today': cell.isToday,
              'datepicker__day--selected': cell.isSelected,
              'datepicker__day--focused': cell.isFocused,
            }"
            :disabled="cell.isDisabled"
            :aria-pressed="cell.isSelected"
            :data-iso="cell.iso"
            :tabindex="cell.isFocused ? 0 : -1"
            @click="select(cell)"
          >
            {{ cell.day }}
          </button>
        </div>
      </div>
    </Transition>

    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
@use './field';

.datepicker {
  position: relative;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    cursor: pointer;
    text-align: left;
    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }
  &__placeholder {
    color: var(--text-faint);
  }
  &__icon {
    color: var(--text-faint);
    flex-shrink: 0;
  }
  &__pop {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: var(--z-dropdown);
    width: 268px;
    padding: var(--space-3);
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }
  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2);
  }
  &__title {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
    text-transform: capitalize;
  }
  &__nav {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    &:hover {
      background: var(--surface-hover);
      color: var(--text-strong);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
  &__weekdays,
  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  &__weekday {
    display: grid;
    place-items: center;
    height: 26px;
    font-size: var(--text-2xs);
    text-transform: uppercase;
    color: var(--text-faint);
  }
  &__day {
    display: grid;
    place-items: center;
    height: 32px;
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    color: var(--text);
    &:hover:not(:disabled) {
      background: var(--surface-hover);
    }
    &:disabled {
      color: var(--text-faint);
      opacity: 0.45;
      cursor: not-allowed;
    }
    &--muted {
      color: var(--text-faint);
    }
    &--today {
      box-shadow: inset 0 0 0 1px var(--border-strong);
    }
    &--focused:not(&--selected) {
      background: var(--surface-hover);
    }
    &--selected {
      background: var(--accent);
      color: var(--accent-contrast);
      font-weight: var(--weight-semibold);
    }
  }
}
</style>
