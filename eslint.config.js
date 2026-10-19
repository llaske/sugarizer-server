const js = require("@eslint/js");
const globals = require("globals");

const baseRules = {
	indent: ["error", "tab"],
	"linebreak-style": ["error", "unix"],
	semi: ["error", "always"],
	"eol-last": ["error", "always"],
	"no-mixed-spaces-and-tabs": "error",
	"no-unused-vars": [
		"error",
		{
			argsIgnorePattern: "^(err|e)$",
			caughtErrorsIgnorePattern: "^(err|e)$"
		}
	],
	"no-console": 0,
	"no-redeclare": "off"
};

module.exports = [
	{
		linterOptions: {
			reportUnusedDisableDirectives: "off"
		}
	},
	{
		ignores: [
			"eslint.config.js",
			"dashboard/public/js/bootstrap-notify.js",
			"dashboard/public/js/intro.js",
			"dashboard/public/js/bootstrap.min.js",
			"dashboard/public/js/Chart.min.js",
			"dashboard/public/js/jquery-3.1.0.min.js",
			"dashboard/public/js/jquery-ui-1-11-4.js",
			"dashboard/public/js/jquery.datetimepicker.full.js",
			"dashboard/public/js/jquery.ui.sortable-animation.js",
			"dashboard/public/js/jquery.multi-select.js",
			"dashboard/public/js/jquery.searchable.js",
			"dashboard/public/js/l10n.js",
			"dashboard/public/js/material-dashboard.js",
			"dashboard/public/js/material.min.js",
			"dashboard/public/js/moment.min.js",
			"dashboard/public/js/noty.js",
			"dashboard/public/js/pace.min.js",
			"dashboard/public/js/qrcodegen.js",
			"dashboard/public/js/FileSaver.js",
			"dashboard/public/js/select2.min.js",
			"api/controller/utils/qrCodeUtil.js",
			"docs/**",
			"build/**"
		]
	},
	js.configs.recommended,
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: 5,
			sourceType: "script",
			globals: {
				...globals.browser,
				...globals.node,
				...globals.mocha,
				...globals.jquery,
				...globals.amd,
				...globals.mongo,
				db: "writable",
				version: "writable",
				Atomics: "readonly",
				SharedArrayBuffer: "readonly"
			}
		},
		rules: baseRules
	},
	{
		files: ["scripts/seed_users.js"],
		languageOptions: {
			ecmaVersion: 6,
			sourceType: "script"
		},
		rules: {
			indent: "off"
		}
	},
	{
		files: ["dashboard/public/js/main.js"],
		languageOptions: {
			globals: {
				url: "writable",
				headers: "writable",
				icon: "readonly",
				Chart: "readonly",
				QRCode: "readonly",
				saveAs: "readonly",
				Uint8Array: "readonly"
			}
		},
		rules: {
			"no-unused-vars": "off"
		}
	},
	{
		files: ["dashboard/public/js/tutorial.js"],
		rules: {
			"no-unused-vars": "off"
		}
	},
	{
		files: ["dashboard/controller/users/importCSV.js"],
		languageOptions: {
			ecmaVersion: 6,
			sourceType: "script"
		}
	},
	{
		files: ["dashboard/controller/**/*.js", "dashboard/helper/validator.js"],
		languageOptions: {
			ecmaVersion: 2017,
			sourceType: "script"
		}
	},
	{
		files: ["api/**/*.js"],
		languageOptions: {
			ecmaVersion: 6,
			sourceType: "script"
		}
	}
];