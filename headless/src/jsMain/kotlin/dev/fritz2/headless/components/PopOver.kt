package dev.fritz2.headless.components

import dev.fritz2.core.*
import dev.fritz2.headless.foundation.*
import org.w3c.dom.HTMLButtonElement
import org.w3c.dom.HTMLDivElement
import org.w3c.dom.HTMLElement

/**
 * This class provides the building blocks to implement a popover.
 *
 * Use [popOver] functions to create an instance, set up the needed [Hook]s or [Property]s and refine the
 * component by using the further factory methods offered by this class.
 *
 * For more information refer to the [official documentation](https://www.fritz2.dev/headless/popover/)
 */
@Suppress("EXPERIMENTAL_IS_NOT_ENABLED")
class PopOver<C : HTMLElement>(tag: Tag<C>, id: String?) : Tag<C> by tag, OpenClose() {

    val componentId: String by lazy { id ?: Id.next() }

    private var button: Tag<HTMLElement>? = null

    fun render() {
        attr("id", componentId)
    }

    /**
     * Factory function to create a [popOverButton].
     *
     * For more information refer to the
     * [official documentation](https://www.fritz2.dev/headless/popover/#popoverbutton)
     */
    fun <CB : HTMLElement> RenderContext.popOverButton(
        classes: String? = null,
        scope: (ScopeContext.() -> Unit) = {},
        tag: TagFactory<Tag<CB>>,
        content: Tag<CB>.() -> Unit
    ): Tag<CB> {
        addComponentStructureInfo("popOverButton", this@popOverButton.scope, this)
        return tag(this, classes, "$componentId-button", scope) {
            if (!openState.isSet) openState(storeOf(false))
            content()
            attr(Aria.expanded, opened.asString())
            activations() handledBy toggle
        }.also { button = it }
    }

    /**
     * Factory function to create a [popOverButton] with a [HTMLButtonElement] as default [Tag].
     *
     * For more information refer to the
     * [official documentation](https://www.fritz2.dev/headless/popover/#popoverbutton)
     */
    fun RenderContext.popOverButton(
        classes: String? = null,
        scope: (ScopeContext.() -> Unit) = {},
        content: Tag<HTMLButtonElement>.() -> Unit
    ) = popOverButton(classes, scope, RenderContext::button, content).apply {
        attr("type", "button")
    }

    inner class PopOverPanel<C : HTMLElement>(
        renderContext: RenderContext,
        tagFactory: TagFactory<Tag<C>>,
        classes: String?,
        scope: ScopeContext.() -> Unit
    ) : PopUpPanel<C>(
        renderContext,
        tagFactory,
        classes,
        "$componentId-items",
        scope,
        this@PopOver.opened,
        reference = button,
        ariaHasPopup = Aria.HasPopup.dialog
    )

    /**
     * Factory function to create a [popOverPanel].
     *
     * It is recommended to define some explicit z-index within the classes-parameter.
     *
     * For more information refer to the
     * [official documentation](https://www.fritz2.dev/headless/popover/#popoverpanel)
     */
    fun <CP : HTMLElement> RenderContext.popOverPanel(
        classes: String? = null,
        scope: (ScopeContext.() -> Unit) = {},
        tag: TagFactory<Tag<CP>>,
        initialize: PopOverPanel<CP>.() -> Unit
    ) {
        addComponentStructureInfo("popOverPanel", this@popOverPanel.scope, this)
        portal {
            PopOverPanel(this, tag, classes, scope).run {
                initialize()
                render()
                trapFocusWhenever(opened)
                closeOnDismiss()
            }
        }
    }

    /**
     * Factory function to create a [popOverPanel] with a [HTMLDivElement] as default [Tag].
     *
     * It is recommended to define some explicit z-index within the classes-parameter.
     *
     * For more information refer to the
     * [official documentation](https://www.fritz2.dev/headless/popover/#popoverpanel)
     */
    fun RenderContext.popOverPanel(
        classes: String? = null,
        internalScope: (ScopeContext.() -> Unit) = {},
        initialize: PopOverPanel<HTMLDivElement>.() -> Unit
    ) = popOverPanel(classes, internalScope, RenderContext::div, initialize)
}

/**
 * Factory function to create a [PopOver].
 *
 * API-Sketch:
 * ```kotlin
 * popOver {
 *     // inherited by `OpenClose`
 *     val openState: DatabindingProperty<Boolean>
 *     val opened: Flow<Boolean>
 *     val close: SimpleHandler<Unit>
 *     val open: SimpleHandler<Unit>
 *     val toggle: SimpleHandler<Unit>
 *
 *     popOverButton() { }
 *     popOverPanel() {
 *         // inherited by `PopUpPanel`
 *         var placement: Placement
 *         var strategy: Strategy
 *         var flip: Boolean
 *         var skidding: Int
 *         var distance: int
 *     }
 * }
 * ```
 *
 * For more information refer to the [official documentation](https://www.fritz2.dev/headless/popover/#popover)
 */
fun <C : HTMLElement> RenderContext.popOver(
    classes: String? = null,
    id: String? = null,
    scope: (ScopeContext.() -> Unit) = {},
    tag: TagFactory<Tag<C>>,
    initialize: PopOver<C>.() -> Unit
): Tag<C> {
    addComponentStructureInfo("popOver", this@popOver.scope, this)
    return tag(this, joinClasses(classes, PopUpPanel.POPUP_RELATIVE), id, scope) {
        PopOver(this, id).run {
            initialize(this)
            render()
        }
    }
}

/**
 * Factory function to create a [PopOver] with a [HTMLDivElement] as default root [Tag].
 *
 * API-Sketch:
 * ```kotlin
 * popOver {
 *     // inherited by `OpenClose`
 *     val openState: DatabindingProperty<Boolean>
 *     val opened: Flow<Boolean>
 *     val close: SimpleHandler<Unit>
 *     val open: SimpleHandler<Unit>
 *     val toggle: SimpleHandler<Unit>
 *
 *     popOverButton() { }
 *     popOverPanel() {
 *         // inherited by `PopUpPanel`
 *         var placement: Placement
 *         var strategy: Strategy
 *         var flip: Boolean
 *         var skidding: Int
 *         var distance: int
 *     }
 * }
 * ```
 *
 * For more information refer to the [official documentation](https://www.fritz2.dev/headless/popover/#popover)
 */
fun RenderContext.popOver(
    classes: String? = null,
    id: String? = null,
    scope: (ScopeContext.() -> Unit) = {},
    initialize: PopOver<HTMLDivElement>.() -> Unit
): Tag<HTMLDivElement> = popOver(classes, id, scope, RenderContext::div, initialize)
