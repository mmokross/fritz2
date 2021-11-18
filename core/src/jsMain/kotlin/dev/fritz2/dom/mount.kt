package dev.fritz2.dom

import dev.fritz2.binding.Patch
import dev.fritz2.binding.Store
import dev.fritz2.binding.mountSimple
import dev.fritz2.binding.sub
import dev.fritz2.dom.html.Div
import dev.fritz2.dom.html.RenderContext
import dev.fritz2.dom.html.Scope
import dev.fritz2.dom.html.WithJob
import dev.fritz2.lenses.IdProvider
import dev.fritz2.utils.Myer
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Job
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.cancelChildren
import kotlinx.coroutines.flow.*
import kotlinx.dom.clear
import org.w3c.dom.Element
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import kotlin.collections.set

/**
 * Defines type for a handler for lifecycle-events
 */
typealias DomLifecycleHandler = (WithDomNode<Element>, Any?) -> Deferred<Unit>?

internal class DomLifecycle(
    val target: WithDomNode<Element>,
    val handler: DomLifecycleHandler,
    val payload: Any? = null
)

/**
 * External interface to access the MountPoint where the lifecycle of [Tag]s and subtrees is handled.
 */
interface MountPoint {

    /**
     * Registers a [DomLifecycleHandler] on a given target that ist called right after the target is mounted to the DOM.
     * The [MountPoint] waits for the [Deferred] to be completed.
     *
     * @param target the element the lifecycle-handler will be registered for
     * @param payload some optional data that might be used by the [handler] to do its work
     * @param handler defines, what to do (with [payload]), when [target] has just been mounted to the DOM
     */
    fun afterMount(target: WithDomNode<Element>, payload: Any? = null, handler: DomLifecycleHandler)

    /**
     * Registers a [DomLifecycleHandler] on a given target that ist called right before the target is removed from the DOM.
     * The [MountPoint] waits for the [Deferred] to be completed.
     *
     * @param target the element the lifecycle-handler will be registered for
     * @param payload some optional data that might be used by the [handler] to do its work
     * @param handler defines, what to do (with [payload]), when [target] has just been mounted to the DOM
     */
    fun beforeUnmount(target: WithDomNode<Element>, handler: DomLifecycleHandler, payload: Any? = null)
}

internal abstract class MountPointImpl : MountPoint, WithJob {
    fun runBeforeUnmounts(): List<Deferred<Any>> = beforeUnmountListener.mapNotNull {
        it.handler(it.target, it.payload)
    }.also {
        beforeUnmountListener.clear()
    }

    fun runAfterMounts(): List<Deferred<Any>> = afterMountListener.mapNotNull {
        it.handler(it.target, it.payload)
    }.also {
        afterMountListener.clear()
    }

    private val afterMountListener: MutableList<DomLifecycle> by lazy {
        mutableListOf()
    }

    private val beforeUnmountListener: MutableList<DomLifecycle> by lazy {
        mutableListOf()
    }

    override fun afterMount(target: WithDomNode<Element>, payload: Any?, handler: DomLifecycleHandler) {
        afterMountListener.add(DomLifecycle(target, handler, payload))
    }

    override fun beforeUnmount(target: WithDomNode<Element>, handler: DomLifecycleHandler, payload: Any?) {
        beforeUnmountListener.add(DomLifecycle(target, handler, payload))
    }
}

internal val MOUNT_POINT_KEY = Scope.Key<MountPoint>("MOUNT_CONTEXT_LIFECYCLE")

/**
 * Allows to access the nearest [MountPoint] from any [Tag]
 */
fun Tag<*>.mountPoint(): MountPoint? = this.scope[MOUNT_POINT_KEY]

internal class MountContext<T : HTMLElement>(
    override val job: Job,
    val target: Tag<T>,
    mountScope: Scope = target.scope,
) : RenderContext, MountPointImpl() {

    override val scope: Scope = Scope(mountScope).apply { set(MOUNT_POINT_KEY, this@MountContext) }

    override fun <E : Node, T : WithDomNode<E>> register(element: T, content: (T) -> Unit): T {
        return target.register(element, content)
    }
}

internal class BuildContext(
    override val job: Job,
    mountScope: Scope,
) : RenderContext, MountPointImpl() {

    override val scope: Scope = Scope(mountScope).apply { set(MOUNT_POINT_KEY, this@BuildContext) }

    override fun <E : Node, T : WithDomNode<E>> register(element: T, content: (T) -> Unit): T {
        content(element)
        return element
    }
}


internal const val MOUNT_POINT_STYLE_CLASS = "mount-point"
internal val SET_MOUNT_POINT_DATA_ATTRIBUTE: Tag<HTMLElement>.() -> Unit = {
    attr("data-mount-point", true)
}

/**
 * Uses the [content]-lambda to render a subtree for each value on the [upstream]-[Flow] and
 * mounts it to the DOM either
 *  - creating a new context-[Div] as a child of the receiver and adding the content as children to this [Div]
 *  - of, if [into] is set, replacing all children of this [Tag].
 *
 * @param into if set defines the target to mount the content to (replacing its static content)
 * @param upstream the [Flow] that should be mounted at this point
 * @param content lambda definining what to render for a given value on [upstream]
 */
fun <V> RenderContext.mount(
    into: Tag<HTMLElement>?,
    upstream: Flow<V>,
    content: RenderContext.(V) -> Unit
) {
    val target = into?.apply(SET_MOUNT_POINT_DATA_ATTRIBUTE)
        ?: div(MOUNT_POINT_STYLE_CLASS, content = SET_MOUNT_POINT_DATA_ATTRIBUTE)

    val mountContext = MountContext(Job(job), target)

    mountSimple(this.job, upstream) {
        mountContext.job.cancelChildren()
        mountContext.runBeforeUnmounts().awaitAll()
        target.domNode.clear()
        mountContext.content(it)
        mountContext.runAfterMounts().awaitAll()
    }
}

/**
 * Accumulates a [Pair] and a [List] to a new [Pair] of [List]s
 *
 * @param accumulator [Pair] of two [List]s
 * @param newValue new [List] to accumulate
 */
fun <T> accumulate(
    accumulator: Pair<List<T>, List<T>>,
    newValue: List<T>
): Pair<List<T>, List<T>> = Pair(accumulator.second, newValue)


/**
 * Compares each new [List] on [upstream] to its predecessor to create [Patch]es using Myer's diff-algorithm.
 * For each element that is newly inserted it uses the [content]-lambda to render a subtree.
 * The resulting [Patch]es are then applied to the DOM either
 *  - creating a new context-[Div] as a child of the receiver
 *  - or, if [into] is set, replacing all children of this [Tag].
 *  Keep in mind, that if you do not offer an [idProvider] a changed value of a list-item will render a new subtree
 *  for this item. When you provide an [idProvider] though, a new subtree will only be rendered if a new id appears
 *  in the list, and you are responsible for updating the dynamic content (by using sub-[Store]s).
 *
 * @param into if set defines the target to mount the content to (replacing its static content)
 * @param idProvider optional function to identify a unique entity in the list
 * @param upstream the [Flow] that should be mounted
 * @param content lambda definining what to render for a given value on [upstream]
 */
fun <V> RenderContext.mount(
    into: Tag<HTMLElement>?,
    upstream: Flow<List<V>>,
    idProvider: IdProvider<V, *>?,
    content: RenderContext.(V) -> Tag<HTMLElement>
) = mountPatches(into, upstream) { upstreamValues, mountPoints ->
    upstreamValues.scan(Pair(emptyList(), emptyList()), ::accumulate).map { (old, new) ->
        val diff = if (idProvider != null) Myer.diff(old, new, idProvider) else Myer.diff(old, new)
        diff.map { patch ->
            patch.map(job) { value, newJob ->
                val mountPoint = BuildContext(newJob, scope)
                content(mountPoint, value).also {
                    mountPoints[it.domNode] = mountPoint
                }
            }
        }
    }
}

/**
 * Compares each new [List] on [store]'s data-[Flow] to its predecessor to create [Patch]es using Myer's diff-algorithm.
 * For each element that is newly inserted it uses the [content]-lambda to render a subtree.
 * The resulting [Patch]es are then applied to the DOM either
 *  - creating a new context-[Div] as a child of the receiver
 *  - or, if [into] is set, replacing all children of this [Tag].
 *
 * @param into if set defines the target to mount the content to (replacing its static content)
 * @param idProvider function to identify a unique entity in the list
 * @param store the [Store] that's values should be mounted at
 * @param content lambda definining what to render for a given value on [store]'s data-[Flow]
 */
fun <V> RenderContext.mount(
    into: Tag<HTMLElement>?,
    store: Store<List<V>>,
    idProvider: IdProvider<V, *>,
    content: RenderContext.(Store<V>) -> Tag<HTMLElement>
) = mount(into, store.data, idProvider) { value ->
    content(store.sub(value, idProvider))
}

/**
 * Compares each new [List] on [store]'s data-[Flow] to its predecessor element by element to create [Patch]es.
 * For each element that is newly inserted it uses the [content]-lambda to render a subtree.
 * The resulting [Patch]es are then applied to the DOM either
 *  - creating a new context-[Div] as a child of the receiver
 *  - or, if [into] is set, replacing all children of this [Tag].
 *
 * @param into if set defines the target to mount the content to (replacing its static content)
 * @param store the [Store] that's values should be mounted at
 * @param content lambda definining what to render for a given value on [store]'s data-[Flow]
 */
fun <V> RenderContext.mount(
    into: Tag<HTMLElement>?,
    store: Store<List<V>>,
    content: RenderContext.(Store<V>) -> Tag<HTMLElement>
) = mountPatches(into, store.data) { upstream, mountPoints ->
    upstream.map { it.withIndex().toList() }.eachIndex().map { patch ->
        listOf(patch.map(job) { value, newJob ->
            val mountPoint = BuildContext(newJob, scope)
            content(mountPoint, store.sub(value.index)).also {
                mountPoints[it.domNode] = mountPoint
            }
        })
    }
}


/**
 * Compares each new [List] on a [Flow] to its predecessor element by element to create [Patch]es.
 *
 * @return [Flow] of [Patch]es
 */
fun <V> Flow<List<V>>.eachIndex(): Flow<Patch<V>> =
    this.scan(Pair(emptyList(), emptyList()), ::accumulate).flatMapConcat { (old, new) ->
        val oldSize = old.size
        val newSize = new.size
        when {
            oldSize < newSize -> flowOf<Patch<V>>(
                Patch.InsertMany(
                    new.subList(oldSize, newSize).reversed(),
                    oldSize
                )
            )
            oldSize > newSize -> flowOf<Patch<V>>(Patch.Delete(newSize, (oldSize - newSize)))
            else -> emptyFlow()
        }
    }


/**
 * Mounts a [Flow] of [Patch]es to the DOM either
 *  - creating a new context-[Div] as a child of the receiver
 *  - or, if [into] is set, replacing all children of this [Tag].
 *
 * @param into if set defines the target to mount the content to (replacing its static content)
 * @param upstream the [Flow] that should be mounted
 * @param createPatches lambda defining, how to compare two versions of a [List]
 */
internal fun <V> RenderContext.mountPatches(
    into: Tag<HTMLElement>?,
    upstream: Flow<List<V>>,
    createPatches: (Flow<List<V>>, MutableMap<Node, MountPointImpl>) -> Flow<List<Patch<Tag<HTMLElement>>>>,
) {
    val target = into?.apply {
        this.domNode.clear()
        SET_MOUNT_POINT_DATA_ATTRIBUTE()
    }
        ?: div(MOUNT_POINT_STYLE_CLASS, content = SET_MOUNT_POINT_DATA_ATTRIBUTE)

    val mountPoints = mutableMapOf<Node, MountPointImpl>()

    mountSimple(target.job, createPatches(upstream, mountPoints)) { patches ->
        patches.forEach { patch ->
            when (patch) {
                is Patch.Insert -> {
                    target.domNode.insert(patch.element, patch.index)
                    val mountPointImpl = mountPoints[patch.element.domNode]
                    if (mountPointImpl != null) mountPointImpl.runAfterMounts()
                    else console.error("could not run afterMount on inserting ${patch.element}")
                }
                is Patch.InsertMany -> {
                    target.domNode.insertMany(patch.elements, patch.index)
                    patch.elements.forEach { element ->
                        val mountPointImpl = mountPoints[element.domNode]
                        if (mountPointImpl != null) mountPointImpl.runAfterMounts()
                        else console.error("could not run afterMount on inserting $element")
                    }
                }
                is Patch.Delete -> target.domNode.delete(patch.start, patch.count) { node ->
                    val mountPointImpl = mountPoints.remove(node)
                    if (mountPointImpl != null) {
                        mountPointImpl.job.cancelChildren()
                        mountPointImpl.runBeforeUnmounts().awaitAll()
                    } else console.error("could not cancel renderEach-job for node $node!")
                }
                is Patch.Move -> target.domNode.move(patch.from, patch.to)
            }
        }
    }
}


/**
 * Inserts or appends elements to the DOM.
 *
 * @receiver target DOM-Node
 * @param child Node to insert or append
 * @param index place to insert or append
 */
private fun <N : Node> N.insertOrAppend(child: Node, index: Int) {
    if (index == childNodes.length) appendChild(child)
    else childNodes.item(index)?.let {
        insertBefore(child, it)
    }
}

/**
 * Inserts or appends elements to the DOM.
 *
 * @receiver target DOM-Node
 * @param element from type [WithDomNode]
 * @param index place to insert or append
 */
fun <N : Node> N.insert(element: WithDomNode<N>, index: Int): Unit = insertOrAppend(element.domNode, index)

/**
 * Inserts a [List] of elements to the DOM.
 *
 * @receiver target DOM-Node
 * @param elements [List] of [WithDomNode]s elements to insert
 * @param index place to insert or append
 */
fun <N : Node> N.insertMany(elements: List<WithDomNode<N>>, index: Int) {
    if (index == childNodes.length) {
        for (child in elements.reversed()) appendChild(child.domNode)
    } else {
        childNodes.item(index)?.let {
            for (child in elements.reversed()) {
                insertBefore(child.domNode, it)
            }
        }
    }
}

/**
 * Deletes elements from the DOM.
 *
 * @receiver target DOM-Node
 * @param start position for deleting
 * @param count of elements to delete
 */
suspend fun <N : Node> N.delete(start: Int, count: Int, cancelJob: suspend (Node) -> Unit) {
    var itemToDelete = childNodes.item(start)
    repeat(count) {
        itemToDelete?.let {
            cancelJob(it)
            itemToDelete = it.nextSibling
            removeChild(it)
        }
    }
}

/**
 * Moves elements from on place to another in the DOM.
 *
 * @receiver target DOM-Node
 * @param from position index
 * @param to position index
 */
fun <N : Node> N.move(from: Int, to: Int) {
    val itemToMove = childNodes.item(from)
    if (itemToMove != null) insertOrAppend(itemToMove, to)
}

