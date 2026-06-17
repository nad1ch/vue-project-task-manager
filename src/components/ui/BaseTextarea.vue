<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
  modelValue: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [string]; blur: [] }>();

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true"> *</span>
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      class="field__control"
      :class="{ 'field__control--error': Boolean(error) }"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      @input="onInput"
      @blur="emit('blur')"
    />
    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
@use './field';
</style>
