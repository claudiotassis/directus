import { defineInterface } from '@directus/shared/utils/browser';
import InterfaceInputHash from './input-hash.vue';

export default defineInterface({
	id: 'input-hash',
	name: '$t:interfaces.input-hash.hash',
	description: '$t:interfaces.input-hash.description',
	icon: 'fingerprint',
	component: InterfaceInputHash,
	types: ['hash'],
	options: [
		{
			field: 'placeholder',
			name: '$t:placeholder',
			type: 'string',
			meta: {
				width: 'half',
				interface: 'input',
				options: {
					placeholder: '$t:enter_a_placeholder',
				},
			},
		},
		{
			field: 'masked',
			name: '$t:interfaces.input-hash.masked',
			type: 'boolean',
			meta: {
				width: 'half',
				interface: 'boolean',
				options: {
					label: '$t:interfaces.input-hash.masked_label',
				},
			},
			schema: {
				default_value: false,
			},
		},
	],
});
