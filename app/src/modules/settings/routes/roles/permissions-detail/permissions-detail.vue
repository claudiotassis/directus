<template>
	<v-drawer
		:title="modalTitle"
		:model-value="isOpen"
		class="new-collection"
		persistent
		:sidebar-label="currentTabInfo && currentTabInfo.text"
		@cancel="close"
	>
		<template v-if="!loading" #sidebar>
			<tabs v-model:current-tab="currentTab" :tabs="tabs" />
		</template>

		<div v-if="!loading" class="content">
			<permissions
				v-if="currentTab[0] === 'permissions'"
				v-model:permission="permission"
				:role="role"
				:app-minimal="appMinimal && appMinimal.permissions"
			/>
			<fields
				v-if="currentTab[0] === 'fields'"
				v-model:permission="permission"
				:role="role"
				:app-minimal="appMinimal && appMinimal.fields"
			/>
			<validation
				v-if="currentTab[0] === 'validation'"
				v-model:permission="permission"
				:role="role"
				:app-minimal="appMinimal && appMinimal.validation"
			/>
			<presets
				v-if="currentTab[0] === 'presets'"
				v-model:permission="permission"
				:role="role"
				:app-minimal="appMinimal && appMinimal.presets"
			/>
		</div>

		<template v-if="!loading" #actions>
			<actions :role-key="roleKey" :permission="permission" @refresh="$emit('refresh', +permissionKey)" />
		</template>
	</v-drawer>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, ref, computed, watch } from 'vue';
import api from '@/api';
import { Permission, Role } from '@directus/shared/types';
import { useCollectionsStore } from '@/stores/';
import { useRouter } from 'vue-router';
import Actions from './components/actions.vue';
import Tabs from './components/tabs.vue';

import Permissions from './components/permissions.vue';
import Fields from './components/fields.vue';
import Validation from './components/validation.vue';
import Presets from './components/presets.vue';
import { unexpectedError } from '@/utils/unexpected-error';
import { appMinimalPermissions } from '../app-permissions';
import { useDialogRoute } from '@/composables/use-dialog-route';

export default defineComponent({
	components: { Actions, Tabs, Permissions, Fields, Validation, Presets },
	props: {
		roleKey: {
			type: String,
			default: null,
		},
		permissionKey: {
			type: String,
			required: true,
		},
	},
	emits: ['refresh'],
	setup(props) {
		const { t } = useI18n();

		const router = useRouter();

		const collectionsStore = useCollectionsStore();

		const isOpen = useDialogRoute();

		const permission = ref<Permission>();
		const role = ref<Role>();
		const loading = ref(false);

		const collectionName = computed(() => {
			if (!permission.value) return null;
			return collectionsStore.collections.find((collection) => collection.collection === permission.value!.collection)
				?.name;
		});

		const modalTitle = computed(() => {
			if (loading.value || !permission.value) return t('loading');

			if (props.roleKey) {
				return role.value!.name + ' -> ' + collectionName.value + ' -> ' + t(permission.value.action);
			}

			return t('public') + ' -> ' + collectionName.value + ' -> ' + t(permission.value.action);
		});

		watch(() => props.permissionKey, load, { immediate: true });

		const tabs = computed(() => {
			if (!permission.value) return [];

			const action = permission.value.action;

			const tabs = [];

			if (['read', 'update', 'delete'].includes(action)) {
				tabs.push({
					text: t('item_permissions'),
					value: 'permissions',
					hasValue: permission.value.permissions !== null && Object.keys(permission.value.permissions).length > 0,
				});
			}

			if (['create', 'read', 'update'].includes(action)) {
				tabs.push({
					text: t('field_permissions'),
					value: 'fields',
					hasValue: permission.value.fields !== null,
				});
			}

			if (['create', 'update'].includes(action)) {
				tabs.push({
					text: t('field_validation'),
					value: 'validation',
					hasValue: permission.value.validation !== null && Object.keys(permission.value.validation).length > 0,
				});
			}

			if (['create', 'update'].includes(action)) {
				tabs.push({
					text: t('field_presets'),
					value: 'presets',
					hasValue: permission.value.presets !== null && Object.keys(permission.value.presets).length > 0,
				});
			}

			return tabs;
		});

		const currentTab = ref<string[]>([]);

		const currentTabInfo = computed(() => {
			const tabKey = currentTab.value?.[0];
			if (!tabKey) return null;
			return tabs.value.find((tab) => tab.value === tabKey);
		});

		watch(
			tabs,
			(newTabs, oldTabs) => {
				if (newTabs && oldTabs && newTabs.length === oldTabs.length) return;
				currentTab.value = [tabs?.value?.[0]?.value];
			},
			{ immediate: true }
		);

		const appMinimal = computed(() => {
			if (!permission.value) return null;
			return appMinimalPermissions.find(
				(p: Partial<Permission>) =>
					p.collection === permission.value!.collection && p.action === permission.value!.action
			);
		});

		return { isOpen, permission, role, loading, modalTitle, tabs, currentTab, currentTabInfo, appMinimal, close };

		function close() {
			router.push(`/settings/roles/${props.roleKey || 'public'}`);
		}

		async function load() {
			loading.value = true;

			try {
				if (props.roleKey) {
					const response = await api.get(`/roles/${props.roleKey}`);
					role.value = response.data.data;
				}

				const response = await api.get(`/permissions/${props.permissionKey}`);
				permission.value = response.data.data;
			} catch (err) {
				if (err?.response?.status === 403) {
					router.push(`/settings/roles/${props.roleKey || 'public'}`);
				} else {
					unexpectedError(err);
				}
			} finally {
				loading.value = false;
			}
		}
	},
});
</script>

<style lang="scss" scoped>
.content {
	padding: var(--content-padding);
	padding-top: 0;
	padding-bottom: var(--content-padding);
}
</style>
