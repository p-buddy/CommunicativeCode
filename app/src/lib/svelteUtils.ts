/**
 * A really useful utility type, that can be used as an argument type to a function 
 * that should re-run every time that value changes {@link https://svelte.dev/tutorial/reactive-declarations|Svelte's reactivity}) 
 * (even though that argument is likely not used in the function).
 */
export type TReactivityDependency = any | any[];

/**
 * Useful utility type to make use of {@link https://svelte.dev/tutorial/class-shorthand|Svelte's shorthand class directive} 
 * using a boolean variable.
 * @example
 * <script lang="ts">
 * const someClass: TSvelteCssClass = true;
 * </script>
 * 
 * <style>
 * .someClass {
 *  color: black;
 * }
 * </style>
 * 
 * <div class:someClass />
 */
export type TSvelteCssClass = boolean & true;