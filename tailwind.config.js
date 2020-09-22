const { theme } = require('tailwindcss/stubs/defaultConfig.stub')

module.exports = {
	theme: {
		extend: {}
	},
	variants: {
		textColor: ['hover', 'group-hover', 'responsive'],
		backgroundColor: ['hover', 'group-hover', 'responsive', 'odd', 'even']
	},
	plugins: []
}
