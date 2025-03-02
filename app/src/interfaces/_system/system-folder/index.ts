import { defineInterface } from '@directus/shared/utils/browser';
import InterfaceSystemFolder from './folder.vue';

export default defineInterface({
	id: 'system-folder',
	name: '$t:interfaces.system-folder.folder',
	description: '$t:interfaces.system-folder.description',
	icon: 'folder',
	component: InterfaceSystemFolder,
	types: ['uuid'],
	options: [],
	system: true,
	recommendedDisplays: ['raw'],
});
