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

ask(${objectName}).to(\"${functionName}\");`;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { compileEditorToJs, createEditor } from '$lib/monaco';
	import type { TEditorHandle } from '$lib/monaco';
	import { EModuleType, getModulesOfType } from '$lib/modules';
	import { bundle, loadRollup } from '$lib/rollup';

	let editorHandle: TEditorHandle;
	let tsModules;
	let jsModules;
	let divEl: HTMLDivElement = null;

	let display: string;

	onMount(async () => {
		await loadRollup();
		[tsModules, jsModules] = await Promise.all([
			await getModulesOfType(EModuleType.Typescript),
			await getModulesOfType(EModuleType.Javascript)
		]);
		editorHandle = await createEditor(self, starterCode, divEl, tsModules);
	});

	const emit = async () => {
		const userJs = await compileEditorToJs();
		const r = await bundle([userJs, ...jsModules]);
		display = r.output[0].code;
		eval(display);
	};
</script>

<div bind:this={divEl} style="height: 50vh; width: 50vw;" />

<button on:click={emit}>Emit</button>

{display}
