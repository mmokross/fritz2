package dev.fritz2.core

import kotlinx.coroutines.Job

/**
 * A [Patch] describes the changes made to a [List].
 *
 * Pay attention that the sealed implementations should not be data classes - each generated patch must be applied in
 * every case even though it might "equal" the preceding one. (Imagine deleting the first item of a list at least
 * twice!) Using data classes patches could quite easily become equal and then might be dropped by [mountSimple]!
 * Thus, it is intentional to implement those as regular classes.
 */
sealed class Patch<out T> {
    /**
     * A [Patch] saying, that a new element has been inserted
     *
     * @param element the new element that has been inserted
     * @param index the element has been inserted at this index
     */
    class Insert<T>(val element: T, val index: Int) : Patch<T>() {
        /**
         * maps the new element
         *
         * @param mapping defines, how to map the value of the patch
         */
        override fun <R> map(parentJob: Job, mapping: (T, Job) -> R): Patch<R> =
            Insert(mapping(element, Job(parentJob)), index)
    }

    /**
     * A [Patch] saying, that a several element have been inserted
     *
     * @param elements the new elements that have been inserted
     * @param index the elements have been inserted at this index
     */
    class InsertMany<T>(val elements: List<T>, val index: Int) : Patch<T>() {
        /**
         * maps each of the new elements
         *
         * @param mapping defines, how to map the values of the patch
         */
        override fun <R> map(parentJob: Job, mapping: (T, Job) -> R): Patch<R> = InsertMany(elements.map {
            mapping(it, Job(parentJob))
        }, index)
    }

    /**
     * A [Patch] saying, that one or more elements have been deleted
     *
     * @param start the index of the first element, that has been deleted
     * @param count the number of elements, that have to be deleted
     */
    class Delete<T>(val start: Int, val count: Int = 1) : Patch<T>() {
        /**
         * nothing to be mapped here...
         */
        override fun <R> map(parentJob: Job, mapping: (T, Job) -> R): Patch<R> = this.unsafeCast<Patch<R>>()
    }

    /**
     * A [Patch] saying, that an element has been moved from one position to another.
     * This is only used on mounts with a corresponding [IdProvider].
     *
     * @param from old index of the element
     * @param to new index of the element
     */
    class Move<T>(val from: Int, val to: Int) : Patch<T>() {
        /**
         * nothing to be mapped here...
         */
        override fun <R> map(parentJob: Job, mapping: (T, Job) -> R): Patch<R> = this.unsafeCast<Patch<R>>()
    }

    /**
     * a convenience-method, to map the values encapsulated in a [Patch]
     *
     * @param mapping defines, how to map the values of the patch
     */
    abstract fun <R> map(parentJob: Job, mapping: (T, Job) -> R): Patch<R>
}
