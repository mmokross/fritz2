package dev.fritz2.core

import kotlinx.browser.document
import kotlinx.coroutines.Job
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import kotlinx.dom.clear
import org.w3c.dom.HTMLElement
import org.w3c.dom.HTMLStyleElement
import org.w3c.dom.Node
import org.w3c.dom.css.CSSStyleSheet

/**
 * Occurs when the targeted html element is not present in document.
 *
 * @param message exception message
 */
class MountTargetNotFoundException(message: String) : Exception(message)

/**
 * Creates a [RenderContext] for [Tag]s and
 * mounts it to a constant element in the static html file
 * which id matches the [selector].
 *
 * @param selector [query selector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
 * of the element to mount to
 * @param override if true all child elements are removed before rendering
 * @param scope scope for tag
 * @param content [RenderContext] for rendering the data to the DOM
 * @throws MountTargetNotFoundException if target element with [selector] not found
 */
fun render(
    selector: String,
    override: Boolean = true,
    scope: (ScopeContext.() -> Unit) = {},
    content: RenderContext.() -> Unit
) {
    document.querySelector(selector)?.let { parentElement ->
        if (parentElement is HTMLElement) {
            render(parentElement, override, scope, content)
        } else MountTargetNotFoundException("element with id=$selector is not an HTMLElement")
    } ?: throw MountTargetNotFoundException("html document contains no element with id=$selector")
}

/**
 * Creates a [RenderContext] for [Tag]s and mounts it to a [targetElement].
 *
 * @param targetElement [HTMLElement] to mount to, default is *document.body*
 * @param override if true all child elements are removed before rendering
 * @param content [RenderContext] for rendering the data to the DOM
 * @param scope scope for tag
 * @throws MountTargetNotFoundException if [targetElement] not found
 */
fun render(
    targetElement: HTMLElement? = document.body,
    override: Boolean = true,
    scope: (ScopeContext.() -> Unit) = {},
    content: RenderContext.() -> Unit
) {
    //add style sheet containing mount-point-class
    addGlobalStyle(".$MOUNT_POINT_STYLE_CLASS { display: contents; }")

    if (targetElement != null) {
        if (override) targetElement.clear()

        val mountPoint = object : RenderContext, MountPointImpl() {
            override val job = Job()
            override val scope: Scope = ScopeContext(Scope()).also {
                scope(it)
                it.set(MOUNT_POINT_KEY, this)
            }.scope

            override fun <N : Node, W : WithDomNode<N>> register(element: W, content: (W) -> Unit): W {
                content(element)
                targetElement.appendChild(element.domNode)
                return element
            }

        }

        MainScope().launch {
            content(mountPoint)
            mountPoint.runAfterMounts()
        }

    } else throw MountTargetNotFoundException("targetElement should not be null")
}

const val FRITZ2_GLOBAL_STYLESHEET_ID = "fritz2-global-styles"

internal fun getOrCreateGlobalStylesheet() = (document.getElementById(FRITZ2_GLOBAL_STYLESHEET_ID)?.let {
    (it as HTMLStyleElement).sheet
} ?: (document.createElement("style") as HTMLStyleElement).also {
    it.setAttribute("id", FRITZ2_GLOBAL_STYLESHEET_ID)
    it.appendChild(document.createTextNode(""))
    document.head!!.appendChild(it)
}.sheet!!) as CSSStyleSheet

/**
 * Adds global css-rules to a fritz2-specific stylesheet added to the document when first called
 *
 * @param css the valid css-code to insert
 */
fun addGlobalStyle(css: String) {
    getOrCreateGlobalStylesheet().insertRule(css, 0)
}

/**
 * Adds global css-rules to a fritz2-specific stylesheet added to the document when first called
 *
 * @param css the valid rules to insert
 */
fun addGlobalStyles(css: List<String>) {
    val stylesheet = getOrCreateGlobalStylesheet()
    css.forEach { stylesheet.insertRule(it, 0) }
}

/**
 * Joins all given [classes] strings to one html-class-attribute [String]
 * by filtering all out which are null or blank.
 */
@Deprecated("Use joinClasses instead.", ReplaceWith("joinClasses(*classes)"))
fun classes(vararg classes: String?): String = joinClasses(*classes)

/**
 * Joins all given [classes] strings to one html-class-attribute [String].
 * Individual Strings that are null or blank are filtered out.
 *
 * #### Examples
 *
 * ```
 * val classes = joinClasses(
 *     "class1",
 *     null,
 *     "class2",
 *     ""
 * )
 * println(classes) // prints "class1 class2"
 * ```
 *
 * Using this function, it is also possible to conditionally construct classes strings without having
 * to do dangerous string concatenation:
 *
 * ```
 * val classes = joinClasses(
 *    "class1",
 *    "class2".takeIf { it.length > 10 }
 * )
 *
 * println(classes) // prints "class1"
 * ```
 */
fun joinClasses(vararg classes: String?): String =
    classes.filterNot(String?::isNullOrBlank).joinToString(separator = " ")

/**
 * Helper function to call a native js function with concrete return type [T]
 */
@JsName("Function")
internal external fun <T> nativeFunction(vararg params: String, block: String): T