<template>
	<v-notice v-if="!selectedInterface">
		{{ t('select_interface') }}
	</v-notice>

	<v-notice v-else-if="!selectedInterface.options">
		{{ t('no_options_available') }}
	</v-notice>

	<div v-else class="inset">
		<v-form
			v-if="Array.isArray(selectedInterface.options)"
			:fields="selectedInterface.options"
			primary-key="+"
			:model-value="value"
			@update:model-value="$emit('input', $event)"
		/>

		<component
			:is="`interface-options-${selectedInterface.id}`"
			v-else
			:value="value"
			:field-data="fieldData"
			@input="$emit('input', $event)"
		/>
	</div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, computed, inject, ref } from 'vue';
import { getInterfaces } from '@/interfaces';
import { InterfaceConfig } from '@directus/shared/types';

export default defineComponent({
	props: {
		value: {
			type: Object,
			default: null,
		},
		interfaceField: {
			type: String,
			required: true,
		},
	},
	emits: ['input'],
	setup(props) {
		const { t } = useI18n();

		const { interfaces } = getInterfaces();

		const values = inject('values', ref<Record<string, any>>({}));

		const selectedInterface = computed(() => {
			if (!values.value[props.interfaceField]) return;

			return interfaces.value.find((inter: InterfaceConfig) => inter.id === values.value[props.interfaceField]);
		});

		return { t, selectedInterface, values };
	},
});
</script>

<style lang="scss" scoped>
.inset {
	padding: 8px;
	border: var(--border-width) solid var(--border-normal);
	border-radius: var(--border-radius);
}
</style>
