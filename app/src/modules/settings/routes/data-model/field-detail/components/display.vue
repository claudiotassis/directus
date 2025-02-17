<template>
	<div>
		<v-fancy-select v-model="fieldData.meta.display" class="select" :items="selectItems" />

		<v-notice v-if="fieldData.meta.display && !selectedDisplay" class="not-found" type="danger">
			{{ t('display_not_found', { display: fieldData.meta.display }) }}
			<div class="spacer" />
			<button @click="fieldData.meta.display = null">{{ t('reset_display') }}</button>
		</v-notice>

		<template v-if="fieldData.meta.display && selectedDisplay">
			<v-notice v-if="!selectedDisplay.options || selectedDisplay.options.length === 0">
				{{ t('no_options_available') }}
			</v-notice>

			<v-form
				v-else-if="Array.isArray(selectedDisplay.options)"
				v-model="fieldData.meta.display_options"
				:fields="selectedDisplay.options"
				primary-key="+"
			/>

			<component
				:is="`display-options-${selectedDisplay.id}`"
				v-else
				:value="fieldData.meta.display_options"
				:collection="collection"
				:field-data="fieldData"
				:relations="relations"
				:new-fields="newFields"
				:new-collections="newCollections"
				@input="fieldData.meta.display_options = $event"
			/>
		</template>
	</div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, computed, toRefs } from 'vue';
import { getDisplays } from '@/displays';
import { getInterfaces } from '@/interfaces';
import { FancySelectItem } from '@/components/v-fancy-select/types';
import { clone } from 'lodash';

import { state, availableDisplays } from '../store';
import { InterfaceConfig, DisplayConfig } from '@directus/shared/types';

export default defineComponent({
	props: {
		type: {
			type: String,
			required: true,
		},
		collection: {
			type: String,
			required: true,
		},
	},
	setup() {
		const { t } = useI18n();

		const { displays } = getDisplays();
		const { interfaces } = getInterfaces();

		const selectedInterface = computed(() => {
			return interfaces.value.find((inter: InterfaceConfig) => inter.id === state.fieldData.meta?.interface);
		});

		const selectItems = computed(() => {
			let recommended = clone(selectedInterface.value?.recommendedDisplays) || [];

			recommended.push('raw', 'formatted-value');
			recommended = [...new Set(recommended)];

			const displayItems: FancySelectItem[] = availableDisplays.value.map((display) => {
				const item: FancySelectItem = {
					text: display.name,
					description: display.description,
					value: display.id,
					icon: display.icon,
				};

				if (recommended.includes(item.value as string)) {
					item.iconRight = 'star';
				}

				return item;
			});

			const recommendedItems: (FancySelectItem | { divider: boolean } | undefined)[] = [];

			const recommendedList = recommended.map((key: any) => displayItems.find((item) => item.value === key));
			if (recommendedList !== undefined) {
				recommendedItems.push(...recommendedList.filter((i: any) => i));
			}

			if (displayItems.length >= 5 && recommended.length > 0) {
				recommendedItems.push({ divider: true });
			}

			const displayList = displayItems.filter((item) => recommended.includes(item.value as string) === false);
			if (displayList !== undefined) {
				recommendedItems.push(...displayList.filter((i) => i));
			}

			return recommendedItems;
		});

		const selectedDisplay = computed(() => {
			return displays.value.find((display: DisplayConfig) => display.id === state.fieldData.meta?.display);
		});

		const { fieldData, relations, newCollections, newFields } = toRefs(state);

		return { t, fieldData, selectItems, selectedDisplay, relations, newCollections, newFields };
	},
});
</script>

<style lang="scss" scoped>
.type-title,
.select {
	margin-bottom: 32px;
}

.not-found {
	.spacer {
		flex-grow: 1;
	}

	button {
		text-decoration: underline;
	}
}

.v-notice {
	margin-bottom: 36px;
}
</style>
