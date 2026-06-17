<script setup lang="ts">
export interface SelectOption {
  value: string;
  label: string;
}

defineProps<{
  id: string;
  label: string;
  modelValue: string;
  options: ReadonlyArray<SelectOption>;
  error?: string;
  required?: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [string]; blur: [] }>();

function onChange(event: Event): void {
  emit('update:modelValue', (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true"> *</span>
    </label>
    <div class="field__select-wrap">
      <select
        :id="id"
        :value="modelValue"
        class="field__control field__select"
        :class="{ 'field__control--error': Boolean(error) }"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
        @change="onChange"
        @blur="emit('blur')"
      >
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <span class="field__chevron" aria-hidden="true">▾</span>
    </div>
    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
@use './field';

.field__select-wrap {
  position: relative;
}
.field__select {
  appearance: none;
  width: 100%;
  padding-right: var(--space-6);
  cursor: pointer;
}
.field__chevron {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-faint);
  font-size: 11px;
  pointer-events: none;
}
</style>
