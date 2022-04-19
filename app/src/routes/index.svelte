<script lang="ts" context="module">
	const keywords = {
		import: 'import',
		from: 'from'
	};

	const tokens = {
		openCurly: '{',
		closeCurly: '}',
		equals: '=',
		semi: ';',
		declareObject: (name: string): string => `const ${name} ${tokens.equals} ${tokens.openCurly}`,
		closeObject: '};'
	};

	const spacing = {
		tab: '\t',
		empty: ''
	};

	const objectName = 'bunny';
	const functionName = 'hop';

	const starterCode: string = `${keywords.import} ask ${keywords.from} './ask'${tokens.semi}
${keywords.import} {before, after, when} ${keywords.from} './events'${tokens.semi}

${tokens.declareObject(objectName)}
	${spacing.tab}${functionName}: () => {
		console.log("hello");
	}
${tokens.closeObject}

after(bunny, "hop").finally(() => {
	console.log("yessss");
});

self.postMessage("hi");

ask(${objectName}).to(\"${functionName}\");`;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { compileEditorToJs, createEditor } from '$lib/monaco';
	import { EModuleType, getRequiredModulesOfType } from '$lib/modules';
	import { bundle, loadRollup } from '$lib/rollup';
	import type { editor } from 'monaco-editor';
	import { convertCodeToUrl } from '$lib/jsUtils';
	import type { TSvelteCssClass } from '$lib/svelteUtils';

	const editorContainer: TSvelteCssClass = true;

	let editor: editor.IStandaloneCodeEditor;
	let editorContainerDiv: HTMLDivElement = null;

	onMount(async () => {
		[, editor] = await Promise.all([
			loadRollup(),
			createEditor(
				self,
				starterCode,
				editorContainerDiv,
				await getRequiredModulesOfType(EModuleType.Typescript)
			)
		]);
	});

	const execute = async () => {
		const [userJs, baseModules] = await Promise.all([
			compileEditorToJs(),
			getRequiredModulesOfType(EModuleType.Javascript)
		]);
		const bundledCode = await bundle([userJs, ...baseModules]);
		const { url, revoke } = convertCodeToUrl(bundledCode);
		const worker = new Worker(url);
		worker.onerror = (e) => console.log(e);
		revoke();
	};
</script>

<div bind:this={editorContainerDiv} class:editorContainer style="height: 50vh; width: 50vw;" />

<button on:click={execute}>Execute</button>

<style>
</style>
