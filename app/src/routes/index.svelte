<script lang="ts">
	import { onMount } from 'svelte';
	import { compileEditorToJs, createEditor } from '$lib/monaco';
	import { EModuleType, getExampleModules, getRequiredModulesOfType } from '$lib/modules';
	import type { TModule } from '$lib/modules';
	import { bundle, loadRollup } from '$lib/rollup';
	import type { editor } from 'monaco-editor';
	import { convertCodeToUrl } from '$lib/jsUtils';
	import type { TSvelteCssClass } from '$lib/svelteUtils';

	const editorContainer: TSvelteCssClass = true;
	let examples: TModule[];

	let editor: editor.IStandaloneCodeEditor;
	let editorContainerDiv: HTMLDivElement = null;

	onMount(async () => {
		let required;
		[, examples, required] = await Promise.all([
			loadRollup(),
			getExampleModules(),
			await getRequiredModulesOfType(EModuleType.Typescript)
		]);
		editor = await createEditor(self, examples[0].code, editorContainerDiv, required);
	});

	const execute = async () => {
		const [userJs, baseModules] = await Promise.all([
			compileEditorToJs(),
			getRequiredModulesOfType(EModuleType.Javascript)
		]);
		const bundledCode = await bundle([userJs, ...baseModules]);
		const { url, revoke } = convertCodeToUrl(bundledCode);
		const worker = new Worker(url);
		revoke();
	};
</script>

<select on:change={(e) => editor.setValue(examples[e.currentTarget.value].code)}>
	{#if examples}
		{#each examples as example, index}
			<option value={index}>{example.path}</option>
		{/each}
	{/if}
</select>
<button on:click={execute}>Execute</button>

<div bind:this={editorContainerDiv} class:editorContainer />

<style>
	.editorContainer {
		height: 90vh;
		width: 50vw;
	}
</style>
