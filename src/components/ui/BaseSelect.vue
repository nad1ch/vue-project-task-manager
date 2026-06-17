<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import AppIcon from './AppIcon.vue';

export interface SelectOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    modelValue: string;
    options: ReadonlyArray<SelectOption>;
    error?: string;
    required?: boolean;
    disabled?: boolean;
  }>(),
  { disabled: false },
);
const emit = defineEmits<{ 'update:modelValue': [string]; blur: [] }>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);
const activeIndex = ref(-1);

const selectedIndex = computed(() => props.options.findIndex((o) => o.value === props.modelValue));
const selectedLabel = computed(() => props.options[selectedIndex.value]?.label ?? 'Select…');
const listboxId = computed(() => `${props.id}-listbox`);

function openMenu(): void {
  if (props.disabled) return;
  open.value = true;
  activeIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0;
}
function closeMenu(emitBlur = true): void {
  if (!open.value) return;
  open.value = false;
  if (emitBlur) emit('blur');
}
function toggle(): void {
  if (open.value) closeMenu();
  else openMenu();
}
function choose(index: number): void {
  const option = props.options[index];
  if (!option) return;
  emit('update:modelValue', option.value);
  closeMenu();
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  switch (event.key) {
    case 'Escape':
      if (open.value) {
        event.preventDefault();
        closeMenu();
      }
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (open.value) choose(activeIndex.value);
      else openMenu();
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (!open.value) openMenu();
      else activeIndex.value = Math.min(activeIndex.value + 1, props.options.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (open.value) activeIndex.value = Math.max(activeIndex.value - 1, 0);
      break;
    default:
      break;
  }
}

function onTriggerBlur(): void {
  // Only report blur when the menu is closed (option clicks keep focus logic intact).
  if (!open.value) emit('blur');
}

function onDocumentPointerDown(event: PointerEvent): void {
  if (open.value && root.value && !root.value.contains(event.target as Node)) {
    closeMenu();
  }
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown));
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown));
</script>

<template>
  <div ref="root" class="field select" :class="{ 'select--open': open }">
    <label :for="id" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true"> *</span>
    </label>

    <button
      :id="id"
      type="button"
      class="field__control select__trigger"
      :class="{ 'field__control--error': Boolean(error) }"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listboxId"
      :aria-invalid="Boolean(error)"
      :disabled="disabled"
      @click="toggle"
      @keydown="onKeydown"
      @blur="onTriggerBlur"
    >
      <span class="select__value" :class="{ 'select__value--placeholder': selectedIndex < 0 }">
        {{ selectedLabel }}
      </span>
      <AppIcon name="chevron-down" :size="15" class="select__chevron" />
    </button>

    <Transition name="select-pop">
      <ul v-if="open" :id="listboxId" class="select__menu" role="listbox">
        <li
          v-for="(option, index) in options"
          :key="option.value"
          class="select__option"
          :class="{
            'select__option--active': index === activeIndex,
            'select__option--selected': option.value === modelValue,
          }"
          role="option"
          :aria-selected="option.value === modelValue"
          @mouseenter="activeIndex = index"
          @click="choose(index)"
        >
          <span>{{ option.label }}</span>
          <AppIcon v-if="option.value === modelValue" name="check-circle" :size="15" class="select__check" />
        </li>
      </ul>
    </Transition>

    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
@use './field';

.select {
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
  &__value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &--placeholder {
      color: var(--text-faint);
    }
  }
  &__chevron {
    color: var(--text-faint);
    transition: transform var(--dur-fast) var(--ease-standard);
    flex-shrink: 0;
  }
  &--open &__chevron {
    transform: rotate(180deg);
  }

  &__menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: var(--z-dropdown);
    max-height: 240px;
    overflow-y: auto;
    margin: 0;
    padding: var(--space-1);
    list-style: none;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }
  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    color: var(--text);
    cursor: pointer;
    &--active {
      background: var(--surface-hover);
      color: var(--text-strong);
    }
    &--selected {
      color: var(--accent);
      font-weight: var(--weight-medium);
    }
  }
  &__check {
    color: var(--accent);
  }
}

.select-pop-enter-active,
.select-pop-leave-active {
  transition:
    opacity var(--dur-fast) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);
  transform-origin: top;
}
.select-pop-enter-from,
.select-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
